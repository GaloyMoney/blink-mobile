{
  description = "Galoy Mobile dev environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    nixpkgs-stable.url = "github:nixos/nixpkgs/nixos-23.11";
    flake-utils.url = "github:numtide/flake-utils";
    android.url = "github:tadfisher/android-nixpkgs";
    ruby-nix.url = "github:bobvanderlinden/nixpkgs-ruby";
    ruby-nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = {
    self,
    nixpkgs,
    nixpkgs-stable,
    flake-utils,
    android,
    ruby-nix,
  }:
    {
      overlay = final: prev: {
        inherit (self.packages.${final.system}) android-sdk;
      };
    }
    // flake-utils.lib.eachSystem ["aarch64-darwin" "x86_64-darwin" "x86_64-linux"] (
      system: let
        overlays = [
          (self: super: {
            nodejs = super.nodejs_20;
            yarn = super.yarn.override {
              nodejs = super.nodejs_20;
            };
          })
        ];

        inherit (nixpkgs) lib;
        pkgs = import nixpkgs {
          inherit system;
          overlays = [
            self.overlay
            ruby-nix.overlays.default
          ];
        };

        pkgsStable = import nixpkgs-stable {
          inherit system;
        };

        ignoringVulns = x: x // {meta = x.meta // {knownVulnerabilities = [];};};
        ruby = pkgs."ruby-2.7.7".override {
          openssl = pkgs.openssl_1_1.overrideAttrs ignoringVulns;
        };

        nativeBuildInputs = with pkgs;
          [
            nodePackages.node-gyp
            yarn
            jdk17
            tilt
            alejandra
            gnumake
            docker-compose
            shellcheck
            shfmt
            vendir
            jq
            ytt
            fastlane

            # Overlays
            android-sdk
            nodejs
            ruby
          ]
          ++ lib.optionals stdenv.isDarwin [
            pkgsStable.cocoapods
            watchman
            xcodes
            darwin.apple_sdk.frameworks.SystemConfiguration
          ];
      in {
        packages = {
          android-sdk = android.sdk.${system} (sdkPkgs:
            with sdkPkgs;
              [
                build-tools-34-0-0
                cmdline-tools-latest
                emulator
                platform-tools
                platforms-android-34
                ndk-25-1-8937393
                cmake-3-22-1

                # Some dependencies we use are on old versions
                # TODO: Update these obsolete dependencies
                build-tools-30-0-3
                build-tools-33-0-1
                platforms-android-33
              ]
              ++ lib.optionals (system == "aarch64-darwin") [
                system-images-android-34-google-apis-arm64-v8a
                system-images-android-34-google-apis-playstore-arm64-v8a
              ]
              ++ lib.optionals (system == "x86_64-darwin" || system == "x86_64-linux") [
                system-images-android-34-google-apis-x86-64
                system-images-android-34-google-apis-playstore-x86-64
              ]);
        };

        devShells.default = pkgs.mkShell {
          inherit nativeBuildInputs;

          ANDROID_HOME = "${pkgs.android-sdk}/share/android-sdk";
          ANDROID_SDK_ROOT = "${pkgs.android-sdk}/share/android-sdk";
          JAVA_HOME = pkgs.jdk17.home;

          shellHook = ''
            export HOST_PROJECT_PATH="$(pwd)"
            export COMPOSE_PROJECT_NAME=galoy-quickstart
            export GALOY_QUICKSTART_PATH="dev/vendor/galoy-quickstart"

            # Check if the AVD already exists
            if ! avdmanager list avd -c | grep -q Pixel_API_34; then
              # Determine ABI based on system architecture and create Pixel_API_34 Android Device
              if [ "${pkgs.stdenv.targetPlatform.system}" = "aarch64-darwin" ]; then ARCH="arm64-v8a"; else ARCH="x86_64"; fi
              echo no | avdmanager create avd --force -n Pixel_API_34 --abi "google_apis_playstore/$ARCH" --package "system-images;android-34;google_apis_playstore;$ARCH" --device 'pixel_6a'
            fi

            XCODE_VERSION="15.3"
            XCODE_BUILD="15E204a" # When updating xcode version, get it by running xcodes installed
            if [[ $(uname) == "Darwin" ]] && [ -z "$CI" ]; then
              if ! xcodes installed | grep "$XCODE_VERSION ($XCODE_BUILD) (Selected)" -q; then
                echo -e "\e[1;33m================================================\e[0m"
                echo -e "\e[1;33mXCode $XCODE_VERSION was not found or is not selected\e[0m"
                echo -e "\e[1;33mYou can install it with \e[0m\e[1;32mxcodes install $XCODE_VERSION\e[0m\e[1;33m and select it with \e[0m\e[1;32mxcodes select $XCODE_VERSION\e[0m\e[1;33m\e[0m"
                echo -e "\e[1;33miOS Builds might not work as expected if the right XCode Version is not being used\e[0m"
                echo -e "\e[1;33m================================================\e[0m"
              fi
            fi

            # XCode needs to find this Node binary
            if [[ $(uname) == "Darwin" ]]; then
              echo "export NODE_BINARY=\"$(which node)\"" > ios/.xcode.env.local
            fi

            # Fix clang for XCode builds
            export PATH=$(echo $PATH | tr ':' '\n' | grep -v clang | paste -sd ':' -)
          '';
        };
      }
    );
}
