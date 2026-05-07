'use strict';

const {Clutter, Gio, GObject, St} = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const SETTINGS_SCHEMA = 'org.gnome.shell.extensions.notification-position';

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

const NotificationPositionIndicator = GObject.registerClass(
class NotificationPositionIndicator extends PanelMenu.Button {
    _init(icon, onSelectPosition, onToggleIndicator, showIndicator) {
        super._init(0.0, 'Notification Position');

        this._onSelectPosition = onSelectPosition;
        this._onToggleIndicator = onToggleIndicator;
        this._items = new Map();

        const panelIcon = new St.Icon({
            gicon: icon,
            style_class: 'system-status-icon',
        });
        this.add_child(panelIcon);

        for (const position of POSITIONS) {
            const item = new PopupMenu.PopupMenuItem(position.label);
            item.connect('activate', () => this._onSelectPosition(position.id, true));
            this.menu.addMenuItem(item);
            this._items.set(position.id, item);
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const showIndicatorItem = new PopupMenu.PopupSwitchMenuItem('Show Tray Icon', showIndicator);
        showIndicatorItem.connect('toggled', (_item, state) => this._onToggleIndicator(state));
        this.menu.addMenuItem(showIndicatorItem);
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
});

let _originalBannerAlignment;
let _originalBannerBinAlignment;
let _originalBannerBinX;
let _originalBannerBinWidth;
let _currentPosition = 'top-right';
let _indicator = null;
let _settings = null;
let _settingsChangedId = 0;
let _positionChangedId = 0;
let _showExampleAfterPositionChange = false;

function _getBannerBin() {
    return Main.messageTray?._bannerBin ?? null;
}

function _original() {
    Main.messageTray.bannerAlignment = _originalBannerAlignment;

    const bannerBin = _getBannerBin();
    if (bannerBin) {
        bannerBin.y_align = _originalBannerBinAlignment;
        bannerBin.x = _originalBannerBinX;
        bannerBin.width = _originalBannerBinWidth;
    }
}

function _setPosition(positionId, showExample = false) {
    const position = POSITIONS.find(candidate => candidate.id === positionId);
    if (!position)
        return;

    const bannerBin = _getBannerBin();
    if (bannerBin) {
        Main.messageTray.bannerAlignment = Clutter.ActorAlign.START;
        _setBannerBinX(position);
        bannerBin.y_align = position.yAlign;
    } else {
        Main.messageTray.bannerAlignment = position.xAlign;
    }

    _currentPosition = position.id;
    _indicator?.setSelected(position.id);

    if (showExample)
        _showExampleNotification(position);
}

function _showExampleNotification(position) {
    Main.notify('Notification position changed', `Banner moved to ${position.label}.`);
}

function _setBannerBinX(position) {
    const bannerBin = _getBannerBin();
    const workArea = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
    const width = _getNotificationWidth();

    // Legacy Shell and downstream extensions such as Pop COSMIC can alter the
    // banner container geometry, so x_align alone is not reliable here.
    bannerBin.width = width;

    if (position.xAlign === Clutter.ActorAlign.END)
        bannerBin.x = workArea.x + workArea.width - width;
    else if (position.xAlign === Clutter.ActorAlign.CENTER)
        bannerBin.x = workArea.x + Math.floor((workArea.width - width) / 2);
    else
        bannerBin.x = workArea.x;
}

function _getNotificationWidth() {
    const dateMenu = Main.panel.statusArea.dateMenu;
    const messageListWidth = dateMenu?._messageList?.width ?? 0;

    if (messageListWidth > 0)
        return messageListWidth;

    const workArea = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
    return Math.min(Math.floor(workArea.width * 0.9), 500);
}

function _createIndicator() {
    const icon = new Gio.FileIcon({
        file: Me.dir.get_child('icons').get_child('notification-position-symbolic.svg'),
    });
    _indicator = new NotificationPositionIndicator(
        icon,
        (positionId, showExample) => _selectPosition(positionId, showExample),
        showIndicator => _settings.set_boolean('show-indicator', showIndicator),
        _settings.get_boolean('show-indicator')
    );
    _indicator.setSelected(_currentPosition);
    Main.panel.addToStatusArea('notification-position', _indicator);
}

function _selectPosition(positionId, showExample = false) {
    if (_settings.get_string('position') === positionId) {
        _setPosition(positionId, showExample);
        return;
    }

    _showExampleAfterPositionChange = showExample;
    _settings.set_string('position', positionId);
}

function _syncPosition() {
    _setPosition(_settings.get_string('position'), _showExampleAfterPositionChange);
    _showExampleAfterPositionChange = false;
}

function _syncIndicator() {
    const showIndicator = _settings.get_boolean('show-indicator');

    if (showIndicator && !_indicator) {
        _createIndicator();
        return;
    }

    if (!showIndicator && _indicator) {
        _indicator.destroy();
        _indicator = null;
    }
}

function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}

function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
    _settings = ExtensionUtils.getSettings(SETTINGS_SCHEMA);
    _settingsChangedId = _settings.connect('changed::show-indicator', _syncIndicator);
    _positionChangedId = _settings.connect('changed::position', _syncPosition);
    _originalBannerAlignment = Main.messageTray.bannerAlignment;
    const bannerBin = _getBannerBin();
    _originalBannerBinAlignment = bannerBin?.y_align ?? Clutter.ActorAlign.START;
    _originalBannerBinX = bannerBin?.x ?? 0;
    _originalBannerBinWidth = bannerBin?.width ?? 0;
    _syncIndicator();
    _syncPosition();
}

function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    _indicator?.destroy();
    _indicator = null;
    if (_settingsChangedId) {
        _settings.disconnect(_settingsChangedId);
        _settingsChangedId = 0;
    }
    if (_positionChangedId) {
        _settings.disconnect(_positionChangedId);
        _positionChangedId = 0;
    }
    _settings = null;
    _original();
}
