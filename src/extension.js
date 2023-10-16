import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class NotificationPosition {

    // Like `init()` below, code *here* in the top-level of your script is executed
    // when your extension is loaded. You MUST NOT make any changes to GNOME Shell
    // here and typically you should do nothing but assign variables.
    constructor() {
        this._originalBannerAlignment = Main.messageTray.bannerAlignment;
    }

    left() {
        Main.messageTray.bannerAlignment = Clutter.ActorAlign.START;
    }

    right() {
        Main.messageTray.bannerAlignment = Clutter.ActorAlign.END;
    }

    middle() {
        Main.messageTray.bannerAlignment = Clutter.ActorAlign.CENTER;
    }

    _original() {
        Main.messageTray.bannerAlignment = this._originalBannerAlignment;
    }

    // This function could be called after your extension is enabled, which could
    // be done from GNOME Tweaks, when you log in or when the screen is unlocked.
    //
    // This is when you setup any UI for your extension, change existing widgets,
    // connect signals or modify GNOME Shell's behaviour.
    enable() {
        this.right();
    }

    // This function could be called after your extension is uninstalled, disabled
    // in GNOME Tweaks, when you log out or when the screen locks.
    //
    // Anything you created, modified or setup in enable() MUST be undone here. Not
    // doing so is the most common reason extensions are rejected during review!
    disable() {
        this._original();
    }
}
