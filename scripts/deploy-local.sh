#!/bin/bash

EXTENSION_NAME="notification-position@drugo.dev"
GNOME_EXT_USER_PATH=$HOME"/.local/share/gnome-shell/extensions/"

EXTENSION_PATH=${GNOME_EXT_USER_PATH}${EXTENSION_NAME}

# Abort if error
set -e

# Make sure extension folder exists
mkdir -p ${EXTENSION_PATH}

# Copy updated files to installation location
cp ./src/* ${EXTENSION_PATH}/

echo "Files copied to ${EXTENSION_PATH}"
echo ""
echo "Restart Gnome Shell with ALT+F2, type 'r' and hit ENTER"
echo ""
