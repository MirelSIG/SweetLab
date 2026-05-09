#!/usr/bin/env bash
set -euo pipefail

HOST_IP="127.0.0.1"
HOST_NAME="sweetlab"
HOSTS_LINE="$HOST_IP $HOST_NAME"

echo "Preparando entorno para servir Sweetlab..."

if ! grep -qE "(^|\s)${HOST_NAME}(\s|$)" /etc/hosts 2>/dev/null; then
  echo "No se encontró entrada para '${HOST_NAME}' en /etc/hosts."
  read -p "¿Deseas añadir '127.0.0.1 ${HOST_NAME}' a /etc/hosts con sudo? [y/N] " answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    echo "Añadiendo entrada a /etc/hosts (se pedirá contraseña sudo)..."
    echo "$HOSTS_LINE" | sudo tee -a /etc/hosts > /dev/null
    echo "Entrada añadida."
  else
    echo "Saltando modificación de /etc/hosts. Asegúrate de mapear '${HOST_NAME}' manualmente si quieres usar esa URL."
  fi
else
  echo "Entrada para '${HOST_NAME}' ya existe en /etc/hosts."
fi

echo "Arrancando servidor de desarrollo Angular (host=0.0.0.0)..."
cd "$(dirname "$0")/.." || exit 1
cd frontend

# Use npx to ensure ng esté disponible incluso si no está globalmente instalado
npx ng serve --host 0.0.0.0 --port 4200
