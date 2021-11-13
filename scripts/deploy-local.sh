#!/bin/bash

EXTENSION_NAME="notification-position@drugo.dev"
GNOME_EXT_USER_PATH=$HOME"/.local/share/gnome-shell/extensions/"

EXTENSION_PATH=${GNOME_EXT_USER_PATH}${EXTENSION_NAME}

SCRIPT_DIR=$(dirname $0)

# Abort if error
set -e

# Make sure extension folder exists
echo "Making sure ${EXTENSION_PATH} exists"
mkdir -p ${EXTENSION_PATH}

echo "Removing whatever is there"
rm -r ${EXTENSION_PATH}/* | true

#echo "Compiling schemas"
#glib-compile-schemas ./src/schemas

echo "Files to copy:"
ls ${SCRIPT_DIR}/../src/

# Copy updated files to installation location
echo "Copying files"
cp -r ${SCRIPT_DIR}/../src/* ${EXTENSION_PATH}/

echo "Files copied to ${EXTENSION_PATH}"
echo ""
echo "Restart Gnome Shell with ALT+F2, type 'r' and hit ENTER"
echo ""
