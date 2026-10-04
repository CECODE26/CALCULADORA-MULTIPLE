#!/usr/bin/env bash
# Vuelve a la versión anterior registrada (o a la indicada).
# Uso: ./deploy/scripts/rollback.sh [tag]
set -euo pipefail
cd "$(dirname "$0")/../.."
HISTORY="deploy/.release-history"
[ -f "$HISTORY" ] || { echo "No hay historial de versiones."; exit 1; }

if [ -n "${1:-}" ]; then
  TARGET="$1"
else
  TARGET="$(tail -n 2 "$HISTORY" | head -n 1)"
  CURRENT="$(tail -n 1 "$HISTORY")"
  [ "$TARGET" != "$CURRENT" ] || { echo "No hay una versión anterior."; exit 1; }
fi

docker image inspect "calculadora-app:${TARGET}" > /dev/null 2>&1 || { echo "La imagen calculadora-app:${TARGET} no existe."; exit 1; }
echo "» Volviendo a ${TARGET}…"
APP_TAG="$TARGET" docker compose up -d --no-deps app
echo "$TARGET" >> "$HISTORY"
docker compose exec -T nginx sh -c 'rm -rf /var/cache/nginx/next/*' || true
echo "✓ Rollback completado. Versión activa: ${TARGET}"
echo "  (El código del repositorio no cambia; para fijarlo: git checkout ${TARGET})"
