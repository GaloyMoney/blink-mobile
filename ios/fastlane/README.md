fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios build

```sh
[bundle exec] fastlane ios build
```

Build Releasable IPA

### ios app_store_upload

```sh
[bundle exec] fastlane ios app_store_upload
```

Upload to App Store TestFlight

### ios promote_to_beta

```sh
[bundle exec] fastlane ios promote_to_beta
```

Promote Testflight build to Beta

### ios promote_to_public

```sh
[bundle exec] fastlane ios promote_to_public
```

Promote Beta build to Public

### ios build_e2e

```sh
[bundle exec] fastlane ios build_e2e
```

Build for end to end tests

### ios browserstack

```sh
[bundle exec] fastlane ios browserstack
```

End to end testing on browserstack

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
