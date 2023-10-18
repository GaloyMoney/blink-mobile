source "https://rubygems.org"
ruby File.read(File.join(__dir__, '.ruby-version')).strip

gem 'fastlane', '2.212.1'
gem 'cocoapods', '~> 1.11', '>= 1.11.3'

plugins_path = File.join(File.dirname(__FILE__), 'ios', 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
