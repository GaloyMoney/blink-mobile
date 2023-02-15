check-code:
	yarn check-code

unit:
	yarn test

test: unit check-code

codegen:
	yarn dev:codegen

reset-ios:
	yarn cache:clear
	yarn install
	yarn ios