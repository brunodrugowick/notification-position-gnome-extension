import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const POSITIONS = [
    {
        id: 'top-left',
        label: 'Top Left',
        xAlign: Clutter.ActorAlign.START,
        yAlign: Clutter.ActorAlign.START,
    },
    {
        id: 'top-center',
        label: 'Top Center',
        xAlign: Clutter.ActorAlign.CENTER,
        yAlign: Clutter.ActorAlign.START,
    },
    {
        id: 'top-right',
        label: 'Top Right',
        xAlign: Clutter.ActorAlign.END,
        yAlign: Clutter.ActorAlign.START,
    },
    {
        id: 'bottom-left',
        label: 'Bottom Left',
        xAlign: Clutter.ActorAlign.START,
        yAlign: Clutter.ActorAlign.END,
    },
    {
        id: 'bottom-right',
        label: 'Bottom Right',
        xAlign: Clutter.ActorAlign.END,
        yAlign: Clutter.ActorAlign.END,
    },
];

class NotificationPositionIndicator extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }

    constructor(onSelectPosition) {
        super(0.0, 'Notification Position');

        this._onSelectPosition = onSelectPosition;
        this._items = new Map();

        const icon = new St.Icon({
            icon_name: 'preferences-system-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(icon);

        for (const position of POSITIONS) {
            const item = new PopupMenu.PopupMenuItem(position.label);
            item.connect('activate', () => this._onSelectPosition(position.id));
            this.menu.addMenuItem(item);
            this._items.set(position.id, item);
        }
    }

    setSelected(positionId) {
        for (const [id, item] of this._items.entries()) {
            item.setOrnament(
                id === positionId
                    ? PopupMenu.Ornament.DOT
                    : PopupMenu.Ornament.NONE
            );
        }
    }
}

export default class NotificationPosition extends Extension {

    // Like `init()` below, code *here* in the top-level of your script is executed
    // when your extension is loaded. You MUST NOT make any changes to GNOME Shell
    // here and typically you should do nothing but assign variables.
    constructor(metadata) {
        super(metadata);
        this._originalBannerAlignment = Main.messageTray.bannerAlignment;
        this._originalBannerBinAlignment = this._getBannerBin()?.y_align ?? Clutter.ActorAlign.START;
        this._currentPosition = 'top-right';
        this._indicator = null;
    }

    _getBannerBin() {
        return Main.messageTray?._bannerBin ?? null;
    }

    _original() {
        Main.messageTray.bannerAlignment = this._originalBannerAlignment;

        const bannerBin = this._getBannerBin();
        if (bannerBin)
            bannerBin.y_align = this._originalBannerBinAlignment;
    }

    _setPosition(positionId, showExample = false) {
        const position = POSITIONS.find(candidate => candidate.id === positionId);
        if (!position)
            return;

        Main.messageTray.bannerAlignment = position.xAlign;

        const bannerBin = this._getBannerBin();
        if (bannerBin)
            bannerBin.y_align = position.yAlign;

        this._currentPosition = position.id;
        this._indicator?.setSelected(position.id);

        if (showExample)
            Main.notify('Notification position changed', `Banner moved to ${position.label}.`);
    }

    _createIndicator() {
        this._indicator = new NotificationPositionIndicator(positionId => {
            this._setPosition(positionId, true);
        });
        this._indicator.setSelected(this._currentPosition);
        Main.panel.addToStatusArea('notification-position', this._indicator);
    }

    // This function could be called after your extension is enabled, which could
    // be done from GNOME Tweaks, when you log in or when the screen is unlocked.
    //
    // This is when you setup any UI for your extension, change existing widgets,
    // connect signals or modify GNOME Shell's behaviour.
    enable() {
        this._createIndicator();
        this._setPosition(this._currentPosition);
    }

    // This function could be called after your extension is uninstalled, disabled
    // in GNOME Tweaks, when you log out or when the screen locks.
    //
    // Anything you created, modified or setup in enable() MUST be undone here. Not
    // doing so is the most common reason extensions are rejected during review!
    disable() {
        this._indicator?.destroy();
        this._indicator = null;
        this._original();
    }
}
