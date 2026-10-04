#!/usr/bin/env bash
# Actualiza el sitio a la última versión de la rama indicada (por defecto main).
# - Construye una imagen etiquetada con el commit (los tests se ejecutan en el build).
# - Arranca la nueva versión y comprueba el healthcheck.
# - Si falla, vuelve automáticamente a la versión anterior.
# Uso: ./deploy/scripts/deploy.sh [rama]
set -euo pipefail
cd "$(dirname "$0")/../.."
BRANCH="${1:-main}"
HISTORY="deploy/.release-history"
touch "$HISTORY"

echo "» Actualizando código (${BRANCH})…"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

TAG="$(git rev-parse --short HEAD)"
PREV="$(tail -n 1 "$HISTORY" || true)"
echo "» Construyendo imagen calculadora-app:${TAG}…"
APP_TAG="$TAG" docker compose build app

echo "» Desplegando ${TAG}…"
APP_TAG="$TAG" docker compose up -d --no-deps app

echo "» Esperando healthcheck…"
for i in $(seq 1 30); do
  STATUS="$(docker inspect -f '{{.State.Health.Status}}' "$(APP_TAG="$TAG" docker compose ps -q app)" 2>/dev/null || echo starting)"
  [ "$STATUS" = "healthy" ] && break
  sleep 2
done

if [ "${STATUS:-}" != "healthy" ]; then
  echo "✗ La nueva versión no está sana."
  if [ -n "$PREV" ]; then
    echo "» Volviendo a ${PREV}…"
    APP_TAG="$PREV" docker compose up -d --no-deps app
  fi
  exit 1
fi

echo "$TAG" >> "$HISTORY"
echo "» Vaciando caché de páginas de Nginx…"
docker compose exec -T nginx sh -c 'rm -rf /var/cache/nginx/next/*' || true
docker compose exec -T nginx nginx -s reload || true

echo "» Limpiando imágenes antiguas (se conservan las 5 últimas versiones)…"
KEEP="$(tail -n 5 "$HISTORY" | tr '\n' '|' | sed 's/|$//')"
docker images calculadora-app --format '{{.Tag}}' | grep -Ev "^(${KEEP}|latest)$" | xargs -r -I{} docker rmi "calculadora-app:{}" || true
echo "✓ Versión ${TAG} en producción."
