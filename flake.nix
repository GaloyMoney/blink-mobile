{
  description = "Galoy Mobile dev environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-23.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      nativeBuildInputs = with pkgs;
        [
          tilt
          alejandra
          gnumake
          docker-compose
          shellcheck
          shfmt
          vendir
          jq
          ytt
        ];
    in
      with pkgs; {
        devShells.default = mkShell {
          inherit nativeBuildInputs;
          shellHook = ''
            export HOST_PROJECT_PATH="$(pwd)"
            export COMPOSE_PROJECT_NAME=galoy-quickstart
            export GALOY_QUICKSTART_PATH="dev/vendor/galoy-quickstart"
          '';
        };

        formatter = alejandra;
      });
}
