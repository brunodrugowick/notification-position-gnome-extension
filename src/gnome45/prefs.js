import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const POSITIONS = [
    ['top-left', 'Top Left'],
    ['top-center', 'Top Center'],
    ['top-right', 'Top Right'],
    ['bottom-left', 'Bottom Left'],
    ['bottom-right', 'Bottom Right'],
];

export default class NotificationPositionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const positionGroup = new Adw.PreferencesGroup({
            title: 'Notification position',
        });
        const rows = new Map();

        for (const [id, label] of POSITIONS) {
            const row = new Adw.ActionRow({title: label});
            row.activatable = true;
            row.connect('activated', () => settings.set_string('position', id));
            rows.set(id, row);
            positionGroup.add(row);
        }

        const syncPosition = () => {
            const selected = settings.get_string('position');
            for (const [id, row] of rows.entries()) {
                row.subtitle = id === selected ? 'Selected' : '';
            }
        };
        settings.connect('changed::position', syncPosition);
        syncPosition();

        const panelGroup = new Adw.PreferencesGroup({
            title: 'Panel menu',
        });
        const showIndicatorRow = new Adw.SwitchRow({
            title: 'Show tray icon',
            subtitle: 'Show the notification position menu in the top panel.',
        });

        settings.bind('show-indicator', showIndicatorRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        panelGroup.add(showIndicatorRow);
        page.add(positionGroup);
        page.add(panelGroup);
        window.add(page);
    }
}
