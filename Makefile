check-code:
	yarn check-code

unit:
	yarn test

test: unit check-code

codegen:
	yarn dev:codegen
	yarn update-translations

reset-ios:
	yarn cache:clear
	yarn install
	yarn ios