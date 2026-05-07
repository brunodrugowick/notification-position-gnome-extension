'use strict';

const {Gio, Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const SETTINGS_SCHEMA = 'org.gnome.shell.extensions.notification-position';

const POSITIONS = [
    ['top-left', 'Top Left'],
    ['top-center', 'Top Center'],
    ['top-right', 'Top Right'],
    ['bottom-left', 'Bottom Left'],
    ['bottom-right', 'Bottom Right'],
];

function _getSettings() {
    const schemaDir = Me.dir.get_child('schemas').get_path();
    const schemaSource = Gio.SettingsSchemaSource.new_from_directory(
        schemaDir,
        Gio.SettingsSchemaSource.get_default(),
        false
    );
    const schema = schemaSource.lookup(SETTINGS_SCHEMA, false);

    return new Gio.Settings({settings_schema: schema});
}

function init() {
}

function buildPrefsWidget() {
    const settings = _getSettings();

    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        margin_top: 18,
        margin_bottom: 18,
        margin_start: 18,
        margin_end: 18,
        spacing: 18,
    });

    _append(box, _buildSectionTitle('Notification position'));

    const positionRows = new Map();
    for (const [id, label] of POSITIONS) {
        const row = _buildPositionRow(label, () => settings.set_string('position', id));
        positionRows.set(id, row.check);
        _append(box, row.button);
    }

    const syncPosition = () => {
        const selected = settings.get_string('position');
        for (const [id, check] of positionRows.entries())
            check.visible = id === selected;
    };
    settings.connect('changed::position', syncPosition);
    syncPosition();

    _append(box, _buildSectionTitle('Panel menu'));
    _append(box, _buildSwitchRow(settings));

    if (box.show_all)
        box.show_all();

    return box;
}

function _buildSectionTitle(title) {
    return new Gtk.Label({
        label: title,
        halign: Gtk.Align.START,
        xalign: 0,
        hexpand: true,
        css_classes: ['heading'],
    });
}

function _buildPositionRow(label, onClick) {
    const button = new Gtk.Button({
        hexpand: true,
    });
    const row = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 12,
        margin_top: 6,
        margin_bottom: 6,
        margin_start: 6,
        margin_end: 6,
    });
    const text = new Gtk.Label({
        label,
        halign: Gtk.Align.START,
        xalign: 0,
        hexpand: true,
    });
    const check = new Gtk.Image({
        icon_name: 'object-select-symbolic',
        visible: false,
    });

    _append(row, text);
    _append(row, check);
    _setChild(button, row);
    button.connect('clicked', onClick);

    return {button, check};
}

function _buildSwitchRow(settings) {
    const row = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 18,
    });
    const label = new Gtk.Label({
        label: 'Show tray icon',
        halign: Gtk.Align.START,
        xalign: 0,
        hexpand: true,
    });
    const toggle = new Gtk.Switch({
        halign: Gtk.Align.END,
        valign: Gtk.Align.CENTER,
    });

    settings.bind('show-indicator', toggle, 'active', Gio.SettingsBindFlags.DEFAULT);

    _append(row, label);
    _append(row, toggle);

    return row;
}

function _append(container, child) {
    if (container.append)
        container.append(child);
    else
        container.add(child);
}

function _setChild(container, child) {
    if (container.set_child)
        container.set_child(child);
    else
        container.add(child);
}
