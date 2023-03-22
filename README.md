# Notification Banner Position Gnome Extension

Changes the notification banner position from the center of the screen to another position of your choice.

Code focuses on being AS SIMPLE AS POSSIBLE to do JUST THAT!

# TODO

- [X] Top-right corner of the screen
- [ ] Preferences screen/menu
- [ ] Top-left corner of the screen
- [ ] Bottom-right corner of the screen?
- [ ] Bottom-left corner of the screen?

# Thanks to

I tried to find an extension to solve my problem and ended up find [this](https://extensions.gnome.org/extension/1568/notification-banner-positionselenium-h/).

I decided to improve but couldn't find the extension's repository, so I created mine.

**Note**: as per feedback, there's, indeed, a good extensions that does what I want. It's called [Panel OSD](https://extensions.gnome.org/extension/708/panel-osd/).
**Note**: there's also [this other awesome extension](https://gitlab.gnome.org/jrahmatzadeh/just-perfection) that does a lot (A LOT!) of things. As per the author's review, I changed my code a little bit, based on his code, so, kudos for him and go check out his extension.

# Contributing

- Mind the CHANGELOG.md file.
- If only supporting a new Gnome version, please match the `version` attribute to the version you're trying to support.

# Deployment to extensions.gnome.org

*_NOTE_*: pending automation preferrably via GitHub Actions

After merging to `master`:

- Go to the `Actions` tab of this repository;
- Locate the `Generate artifact` workflow;
- Click `Run workflow` (you may need to refresh the page to see the new execution);

The artifact to be uploaded to [Gnome Extensions](https://extensions.gnome.org/upload/) is uploaded to the Workflow you just initiated.

