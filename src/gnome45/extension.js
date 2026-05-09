import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Slider} from 'resource:///org/gnome/shell/ui/slider.js';

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

    constructor(indicatorIcon, onSelectPosition, settings) {
        super(0.0, 'Notification Position');

        this._onSelectPosition = onSelectPosition;
        this._settings = settings;
        this._items = new Map();

        const icon = new St.Icon({
            gicon: indicatorIcon,
            style_class: 'system-status-icon',
        });
        this.add_child(icon);

        for (const position of POSITIONS) {
            const item = new PopupMenu.PopupMenuItem(position.label);
            item.connect('activate', () => this._onSelectPosition(position.id, true));
            this.menu.addMenuItem(item);
            this._items.set(position.id, item);
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const marginItem = new PopupMenu.PopupBaseMenuItem({ activate: false });
        const marginBoxLayout = new St.BoxLayout({ vertical: true, x_expand: true });
        const marginLabel = new St.Label({ text: 'Vertical Margin' });
        marginBoxLayout.add_child(marginLabel);
        
        const slider = new Slider(this._settings.get_int('vertical-margin') / 200.0);
        slider.connect('notify::value', () => {
            this._settings.set_int('vertical-margin', Math.round(slider.value * 200));
        });
        this._settings.connect('changed::vertical-margin', () => {
            slider.value = this._settings.get_int('vertical-margin') / 200.0;
        });
        marginBoxLayout.add_child(slider);
        marginItem.add_child(marginBoxLayout);
        this.menu.addMenuItem(marginItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._showIndicatorItem = new PopupMenu.PopupSwitchMenuItem('Show Tray Icon', this._settings.get_boolean('show-indicator'));
        this._showIndicatorItem.connect('toggled', (_item, state) => this._settings.set_boolean('show-indicator', state));
        this.menu.addMenuItem(this._showIndicatorItem);
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

    setShowIndicator(state) {
        this._showIndicatorItem.setToggleState(state);
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
        const bannerBin = this._getBannerBin();
        this._originalMarginTop = bannerBin?.margin_top ?? 0;
        this._originalMarginBottom = bannerBin?.margin_bottom ?? 0;
        this._originalMarginLeft = bannerBin?.margin_left ?? 0;
        this._originalMarginRight = bannerBin?.margin_right ?? 0;
        
        this._currentPosition = 'top-right';
        this._indicator = null;
        this._settings = null;
        this._settingsChangedId = 0;
        this._positionChangedId = 0;
        this._marginChangedId = 0;
        this._showExampleAfterPositionChange = false;
    }

    _getBannerBin() {
        return Main.messageTray?._bannerBin ?? null;
    }

    _original() {
        Main.messageTray.bannerAlignment = this._originalBannerAlignment;

        const bannerBin = this._getBannerBin();
        if (bannerBin) {
            bannerBin.y_align = this._originalBannerBinAlignment;
            bannerBin.margin_top = this._originalMarginTop;
            bannerBin.margin_bottom = this._originalMarginBottom;
            bannerBin.margin_left = this._originalMarginLeft;
            bannerBin.margin_right = this._originalMarginRight;
        }
    }

    _setPosition(positionId, showExample = false) {
        const position = POSITIONS.find(candidate => candidate.id === positionId);
        if (!position)
            return;

        Main.messageTray.bannerAlignment = position.xAlign;

        const bannerBin = this._getBannerBin();
        if (bannerBin) {
            bannerBin.y_align = position.yAlign;
            
            const verticalMargin = this._settings.get_int('vertical-margin');
            const SIDE_MARGIN = 20;

            bannerBin.margin_left = SIDE_MARGIN;
            bannerBin.margin_right = SIDE_MARGIN;
            
            if (position.yAlign === Clutter.ActorAlign.START) {
                bannerBin.margin_top = verticalMargin;
                bannerBin.margin_bottom = 0;
            } else if (position.yAlign === Clutter.ActorAlign.END) {
                bannerBin.margin_top = 0;
                bannerBin.margin_bottom = verticalMargin;
            } else {
                bannerBin.margin_top = verticalMargin;
                bannerBin.margin_bottom = verticalMargin;
            }
        }

        this._currentPosition = position.id;
        this._indicator?.setSelected(position.id);

        if (showExample)
            this._showExampleNotification(position);
    }

    _showExampleNotification(position) {
        Main.notify('Notification position changed', `Banner moved to ${position.label}.`);
    }

    _createIndicator() {
        const icon = new Gio.FileIcon({
            file: this.dir.get_child('icons').get_child('notification-position-symbolic.svg'),
        });
        this._indicator = new NotificationPositionIndicator(
            icon,
            (positionId, showExample) => this._selectPosition(positionId, showExample),
            this._settings
        );
        this._indicator.setSelected(this._currentPosition);
        Main.panel.addToStatusArea('notification-position', this._indicator);
    }

    _selectPosition(positionId, showExample = false) {
        if (this._settings.get_string('position') === positionId) {
            this._setPosition(positionId, showExample);
            return;
        }

        this._showExampleAfterPositionChange = showExample;
        this._settings.set_string('position', positionId);
    }

    _syncPosition() {
        this._setPosition(this._settings.get_string('position'), this._showExampleAfterPositionChange);
        this._showExampleAfterPositionChange = false;
    }

    _syncIndicator() {
        const showIndicator = this._settings.get_boolean('show-indicator');

        if (showIndicator && !this._indicator) {
            this._createIndicator();
            return;
        }

        if (!showIndicator && this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }

    // This function could be called after your extension is enabled, which could
    // be done from GNOME Tweaks, when you log in or when the screen is unlocked.
    //
    // This is when you setup any UI for your extension, change existing widgets,
    // connect signals or modify GNOME Shell's behaviour.
    enable() {
        this._settings = this.getSettings();
        this._settingsChangedId = this._settings.connect('changed::show-indicator', () => {
            this._syncIndicator();
        });
        this._positionChangedId = this._settings.connect('changed::position', () => {
            this._syncPosition();
        });
        this._marginChangedId = this._settings.connect('changed::vertical-margin', () => {
            this._syncPosition();
        });
        this._syncIndicator();
        this._syncPosition();
    }

    // This function could be called after your extension is uninstalled, disabled
    // in GNOME Tweaks, when you log out or when the screen locks.
    //
    // Anything you created, modified or setup in enable() MUST be undone here. Not
    // doing so is the most common reason extensions are rejected during review!
    disable() {
        this._indicator?.destroy();
        this._indicator = null;
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = 0;
        }
        if (this._positionChangedId) {
            this._settings.disconnect(this._positionChangedId);
            this._positionChangedId = 0;
        }
        if (this._marginChangedId) {
            this._settings.disconnect(this._marginChangedId);
            this._marginChangedId = 0;
        }
        this._settings = null;
        this._original();
    }
}
