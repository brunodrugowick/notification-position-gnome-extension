'use strict';

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// Like `extension.js` this is used for any one-time setup like translations.
function init() {
    log(`initializing ${Me.metadata.name} Preferences`);
}

// This function is called when the preferences window is first created to build
// and return a Gtk widget. As an example we'll create and return a GtkLabel.
function buildPrefsWidget() {
    // This could be any GtkWidget subclass, although usually you would choose
    // something like a GtkGrid, GtkBox or GtkNotebook
    let widget = new PrefsWidget();
    widget.show_all();
    return widget;
}

const PrefsWidget = GObject.registerClass(
class PrefsWidget extends Gtk.Box {

  _init (params) {

    // Initialize widget
    super._init(params);
    this.margin = 20;
    this.set_spacing(15);
    this.set_orientation(Gtk.Orientation.VERTICAL);
    this.connect('destroy', Gtk.main_quit);

    // Label
    let myLabel = new Gtk.Label({
      label : "Notification banner position"    
    });

    // Combobox
    let model = new Gtk.ListStore();
    model.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING]);
    let cbox = new Gtk.ComboBox({model: model});
    let renderer = new Gtk.CellRendererText();
    cbox.pack_start(renderer, true);
    cbox.add_attribute(renderer, 'text', 1);
    model.set(model.append(), [0, 1], ['left', 'Left']);
    model.set(model.append(), [0, 1], ['right', 'Right']);
    //cbox.set_active(0); // set value

    cbox.connect('changed', function(entry) {
        let [success, iter] = cbox.get_active_iter();
        if (!success)
            return;
        let myValue = model.get_value(iter, 0); // get value
    });
    
    // Horizontal box to house everything
    let hBox = new Gtk.Box();
    hBox.set_orientation(Gtk.Orientation.HORIZONTAL);
    hBox.pack_start(myLabel, false, false, 0);
    hBox.pack_end(cbox, false, false, 0);

    // Add box to widget
    this.add(hBox);
  }

});

