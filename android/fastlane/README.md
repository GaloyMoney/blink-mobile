fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android test

```sh
[bundle exec] fastlane android test
```

Runs all the tests

### android build

```sh
[bundle exec] fastlane android build
```

Submit a new Beta Build to Crashlytics Beta

### android beta

```sh
[bundle exec] fastlane android beta
```

Deploy a new version to both Play Store and Huawei Store

### android play_store_release

```sh
[bundle exec] fastlane android play_store_release
```

Deploy a new version to the Google Play

### android huawei_release

```sh
[bundle exec] fastlane android huawei_release
```

Deploy a new version to Huawei App Gallery

### android browserstack

```sh
[bundle exec] fastlane android browserstack
```

End to end testing on browserstack

### android build_e2e

```sh
[bundle exec] fastlane android build_e2e
```

Build for end to end testing

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
