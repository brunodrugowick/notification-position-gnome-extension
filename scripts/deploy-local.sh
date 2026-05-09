#!/bin/bash

EXTENSION_NAME="notification-position@drugo.dev"
GNOME_EXT_USER_PATH=$HOME"/.local/share/gnome-shell/extensions/"

EXTENSION_PATH=${GNOME_EXT_USER_PATH}${EXTENSION_NAME}

SCRIPT_DIR=$(dirname $0)
ROOT_DIR=${SCRIPT_DIR}/..
TARGET_LINE=$1

if [[ -z "${TARGET_LINE}" || "${TARGET_LINE}" == "auto" ]]; then
    GNOME_MAJOR_VERSION=$(gnome-shell --version | grep -oE '[0-9]+' | head -n 1)
    if [[ ${GNOME_MAJOR_VERSION} -ge 45 ]]; then
        TARGET_LINE="gnome45"
    else
        TARGET_LINE="legacy"
    fi
fi

SOURCE_PATH=${ROOT_DIR}/src/${TARGET_LINE}

if [[ ! -d "${SOURCE_PATH}" ]]; then
    echo "Unknown extension line '${TARGET_LINE}'. Use 'legacy', 'gnome45' or 'auto'."
    exit 1
fi

# Abort if error
set -e

# Make sure extension folder exists
echo "Making sure ${EXTENSION_PATH} exists"
mkdir -p ${EXTENSION_PATH}

echo "Removing whatever is there"
rm -r ${EXTENSION_PATH}/* | true

echo "Compiling schemas"
glib-compile-schemas ${SOURCE_PATH}/schemas

echo "Files to copy:"
ls ${SOURCE_PATH}

# Copy updated files to installation location
echo "Copying files"
cp -r ${SOURCE_PATH}/* ${EXTENSION_PATH}/

echo "Files copied to ${EXTENSION_PATH}"
echo ""
echo "Restart Gnome Shell with ALT+F2, type 'r' and hit ENTER"
echo ""
