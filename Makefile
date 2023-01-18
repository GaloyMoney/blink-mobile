check-code:
	yarn check-code

unit:
	yarn test

test: unit check-code

codegen:
	yarn dev:codegen

reset-deps:
	yarn cache:clear
	yarn install
