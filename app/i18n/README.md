## i18n

if you want to add or edit a string in the wallet, you need to edit en/index.ts

then you need to run `yarn typesafe-i18n:export` to update the translations for other language.

### why the folder structure?

Galoy-mobile relies on typesafe-i18n which has an [opinionated file structure](https://github.com/ivanhofer/typesafe-i18n/tree/main/packages/generator#folder-structure)