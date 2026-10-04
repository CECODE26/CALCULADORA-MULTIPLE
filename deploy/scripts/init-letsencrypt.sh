#!/usr/bin/env bash
# Obtiene el primer certificado de Let's Encrypt.
# Uso (desde la raíz del proyecto, con .env configurado):
#   ./deploy/scripts/init-letsencrypt.sh            # producción
#   STAGING=1 ./deploy/scripts/init-letsencrypt.sh  # pruebas (sin límites de Let's Encrypt)
set -euo pipefail
cd "$(dirname "$0")/../.."

set -a; source .env; set +a
: "${DOMAIN:?Define DOMAIN en .env}"
: "${LETSENCRYPT_EMAIL:?Define LETSENCRYPT_EMAIL en .env}"
STAGING_FLAG=""; [ "${STAGING:-0}" = "1" ] && STAGING_FLAG="--staging"
LIVE="/etc/letsencrypt/live/${DOMAIN}"

echo "» Creando certificado temporal para arrancar Nginx…"
docker compose run --rm --entrypoint sh certbot -c "
  mkdir -p '${LIVE}' &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout '${LIVE}/privkey.pem' -out '${LIVE}/fullchain.pem' -subj '/CN=localhost'"

echo "» Construyendo y arrancando app + Nginx…"
docker compose up -d --build app nginx

echo "» Eliminando certificado temporal…"
docker compose run --rm --entrypoint sh certbot -c "
  rm -rf '/etc/letsencrypt/live/${DOMAIN}' '/etc/letsencrypt/archive/${DOMAIN}' '/etc/letsencrypt/renewal/${DOMAIN}.conf'"

echo "» Solicitando certificado real para ${DOMAIN} y www.${DOMAIN}…"
docker compose run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot \
  ${STAGING_FLAG} --email "${LETSENCRYPT_EMAIL}" --agree-tos --no-eff-email \
  -d "${DOMAIN}" -d "www.${DOMAIN}"

echo "» Recargando Nginx y arrancando renovación automática…"
docker compose exec nginx nginx -s reload
docker compose up -d certbot
echo "✓ HTTPS listo: https://${DOMAIN}"
