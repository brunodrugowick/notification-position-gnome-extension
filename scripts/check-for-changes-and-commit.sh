#!/bin/bash

# Checks for modifications in the metadata.json file.
if git status | grep -q "metadata.json"; then
	git config --global user.name 'Bruno Drugowick'
	git config --global user.email 'brunodrugowick@users.noreply.github.com'
	echo "New version of Gnome... updating files..."
	git add .
	git commit -am "Supporting new Gnome version"
	git push
else
	echo "No changes detected, nothing will be done."
fi
