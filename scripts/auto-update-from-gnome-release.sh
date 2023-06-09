#!/bin/bash

add_gnome_support() {
    echo "Adding support to Gnome version" $1
    cd $ROOT_PROJECT_DIR
    cat src/metadata.json \
        | jq --arg version "$1" '."shell-version" += [$version]' \
        | jq --arg version "$1" '.version = $version' \
        > src/metadata.json.tmp # it fails if I write directly to the same file
    mv src/metadata.json.tmp src/metadata.json

    sed -i '7 i ## [Autoupdate]\n### Added\n- Automatically added support to new Gnome version\n\n' CHANGELOG.md
    echo $1 > $ROOT_PROJECT_DIR/CURRENT_SUPPORTED_GNOME_VERSION
}

ROOT_PROJECT_DIR=$(pwd)
TEMP_DIR=$(mktemp -d)

cp CURRENT_SUPPORTED_GNOME_VERSION $TEMP_DIR
cd $TEMP_DIR

git clone --depth=1 https://gitlab.gnome.org/GNOME/gnome-software.git
cd gnome-software
git fetch --tags

CURRENT_SUPPORTED_GNOME_VERSION=$(cat ../CURRENT_SUPPORTED_GNOME_VERSION)
echo "Current supported Gnome version is" $CURRENT_SUPPORTED_GNOME_VERSION

for GNOME_TAG in $(git tag -l); do
    echo "Analyzing TAG" $GNOME_TAG
    GNOME_TAG=$(echo $GNOME_TAG | cut -d "." -f 1) # Ignoring minor or patches
    IS_NEW_VERSION=$(bc -ql <<< "$GNOME_TAG > $CURRENT_SUPPORTED_GNOME_VERSION")
    if [[ $IS_NEW_VERSION -eq 1 ]]; then
        echo "Looks like there's a new valid version -->" $GNOME_TAG
        add_gnome_support $GNOME_TAG
        break
    else
        echo "Ignored tag -->" $GNOME_TAG
    fi
done

