'use strict';

// This is a handy import we'll use to grab our extension's object
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// Like `init()` below, code *here* in the top-level of your script is executed
// when your extension is loaded. You MUST NOT make any changes to GNOME Shell
// here and typically you should do nothing but assign variables.
const PADDING = 20;
const monitorWidth = Main.layoutManager.primaryMonitor.width;
const monitorHeight = Main.layoutManager.primaryMonitor.height;
const messageListWidth = Main.panel.statusArea.dateMenu._messageList.actor.width;
const messageListHeight = Main.panel.statusArea.dateMenu._messageList.actor.height;

// This function is called once when your extension is loaded, not enabled. This
// is a good time to setup translations or anything else you only do once.
//
// You MUST NOT make any changes to GNOME Shell, connect any signals or add any
// MainLoop sources here.
function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}

function left()
{
    return - monitorWidth + messageListWidth + PADDING;
}

function right()
{
    return monitorWidth - messageListWidth - PADDING;
}

// This function could be called after your extension is enabled, which could
// be done from GNOME Tweaks, when you log in or when the screen is unlocked.
//
// This is when you setup any UI for your extension, change existing widgets,
// connect signals or modify GNOME Shell's behaviour.
function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);

    Main.messageTray._bannerBin.x = right();
}

// This function could be called after your extension is uninstalled, disabled
// in GNOME Tweaks, when you log out or when the screen locks.
//
// Anything you created, modifed or setup in enable() MUST be undone here. Not
// doing so is the most common reason extensions are rejected during review!
function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    Main.messageTray._bannerBin.x = 0;
    Main.messageTray._bannerBin.y = 0;
}

