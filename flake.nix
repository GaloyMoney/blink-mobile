{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    # This commit has the openssl compatibility with ruby building fixed
    nixpkgs-ruby.url = "github:bobvanderlinden/nixpkgs-ruby/853db1f7f6af87322c18042af555194b1306172f";
  };

  outputs = { self, nixpkgs, nixpkgs-ruby, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [
          (self: super: {
            nodejs = super.nodejs_18;
            yarn = super.yarn.override {
              nodejs = super.nodejs_18;
            };
          })
        ];
        pkgs = import nixpkgs {inherit overlays system;};
        ruby = nixpkgs-ruby.lib.packageFromRubyVersionFile {
          file = ./.ruby-version;
          inherit system;
        };

        gems = pkgs.bundlerEnv {
          name = "gemset";
          inherit ruby;
          gemfile = ./Gemfile;
          lockfile = ./Gemfile.lock;
          gemset = ./gemset.nix;
          groups = [ "default" "production" "development" "test" ];
        };
      in
      {
        devShell = with pkgs;
          mkShell {
            buildInputs = [
              gems.ruby
              ruby
              bundix
              cocoapods
              nodejs
              yarn
              typescript
              alejandra
              gnumake
            ];
          };
      });
}
