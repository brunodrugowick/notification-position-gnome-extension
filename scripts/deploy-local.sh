#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

TARGET_LINE="${1:-gnome45}"

UUID="notification-position@drugo.dev"

SOURCE_PATH="${ROOT_DIR}/src/${TARGET_LINE}"

EXTENSION_PATH="${HOME}/.local/share/gnome-shell/extensions/${UUID}"

echo "Deploying '${TARGET_LINE}' extension..."
echo "Source: ${SOURCE_PATH}"
echo "Target: ${EXTENSION_PATH}"

if [[ ! -d "${SOURCE_PATH}" ]]; then
  echo "ERROR: Source path does not exist:"
  echo "  ${SOURCE_PATH}"
  exit 1
fi

if [[ ! -d "${ROOT_DIR}/schemas" ]]; then
  echo "ERROR: Shared schemas directory not found:"
  echo "  ${ROOT_DIR}/schemas"
  exit 1
fi

mkdir -p "${EXTENSION_PATH}"

rm -rf "${EXTENSION_PATH:?}"/*

echo "Copying extension files..."
cp -r "${SOURCE_PATH}/"* "${EXTENSION_PATH}/"

echo "Copying shared schemas..."
cp -r "${ROOT_DIR}/schemas" "${EXTENSION_PATH}/"

echo "Compiling schemas..."
glib-compile-schemas "${EXTENSION_PATH}/schemas"

echo "Deployment completed successfully."
echo
echo "Restart GNOME Shell:"
echo "  - X11: Alt+F2 -> r"
echo "  - Wayland: logout/login"
