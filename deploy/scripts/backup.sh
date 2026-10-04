#!/usr/bin/env bash
# Copia de seguridad de lo que NO está en git: .env, certificados y
# historial de versiones. La aplicación no guarda datos de usuarios.
# Uso: ./deploy/scripts/backup.sh   (recomendado: cron diario)
set -euo pipefail
cd "$(dirname "$0")/../.."
DEST="deploy/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEST"
chmod 700 "$DEST"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp .env "$TMP/env" 2>/dev/null || echo "Aviso: no existe .env"
cp deploy/.release-history "$TMP/release-history" 2>/dev/null || true
git rev-parse HEAD > "$TMP/commit.txt"

# Certificados (volumen de Docker)
docker run --rm -v calculadora_certbot-etc:/etc/letsencrypt:ro -v "$TMP":/backup alpine \
  tar czf /backup/letsencrypt.tar.gz -C /etc letsencrypt 2>/dev/null || echo "Aviso: sin certificados que copiar"

tar czf "$DEST/backup-${STAMP}.tar.gz" -C "$TMP" .
chmod 600 "$DEST/backup-${STAMP}.tar.gz"
# Conserva los 14 últimos
ls -1t "$DEST"/backup-*.tar.gz | tail -n +15 | xargs -r rm --
echo "✓ Backup: $DEST/backup-${STAMP}.tar.gz"
echo "  Cópialo fuera del servidor (contiene secretos: guárdalo cifrado)."
