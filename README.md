# Notification Banner Position Gnome Extension

Changes the notification banner position from the center of the screen to another position of your choice.

# TODO

- [X] Top-right corner of the screen
- [ ] Preferences screen/menu
- [ ] Top-left corner of the screen
- [ ] Bottom-right corner of the screen
- [ ] Bottom-left corner of the screen

# Thanks to

I tried to find an extension to solve my problem and ended up find [this](https://extensions.gnome.org/extension/1568/notification-banner-positionselenium-h/).

I decided to improve but couldn't find the extension's repository, so I created mine.

> **Note**: as per feedback, there's, indeed, a good extensions that does what I want. It's called [Panel OSD](https://extensions.gnome.org/extension/708/panel-osd/).

# Deployment to extensions.gnome.org

*_NOTE_*: pending automation preferrably via GitHub Actions

After merging to `master`:

- Go to the `Actions` tab of this repository;
- Locate the `Generate artifact` workflow;
- Click `Run workflow` (you may need to refresh the page to see the new execution);

The artifact to be uploaded to [Gnome Extensions](https://extensions.gnome.org/upload/) is uploaded to the Workflow you just initiated.

