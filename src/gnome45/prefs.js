import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

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

        const positionModel = new Gtk.StringList();
        for (const [id, label] of POSITIONS) {
            positionModel.append(label);
        }

        const positionRow = new Adw.ComboRow({
            title: 'Position',
            model: positionModel,
        });

        const syncPosition = () => {
            const selected = settings.get_string('position');
            const selectedIndex = POSITIONS.findIndex(([id]) => id === selected);
            if (selectedIndex !== -1 && positionRow.selected !== selectedIndex) {
                positionRow.selected = selectedIndex;
            }
        };

        positionRow.connect('notify::selected', () => {
            const selectedIndex = positionRow.selected;
            if (selectedIndex >= 0 && selectedIndex < POSITIONS.length) {
                settings.set_string('position', POSITIONS[selectedIndex][0]);
            }
        });

        settings.connect('changed::position', syncPosition);
        syncPosition();

        positionGroup.add(positionRow);

        const marginRow = new Adw.ActionRow({
            title: 'Vertical margin',
            subtitle: 'Distance from top or bottom of the screen',
        });
        const marginSpin = new Gtk.SpinButton({
            valign: Gtk.Align.CENTER,
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 200,
                step_increment: 1,
            }),
        });
        settings.bind('vertical-margin', marginSpin.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        marginRow.add_suffix(marginSpin);
        positionGroup.add(marginRow);

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
