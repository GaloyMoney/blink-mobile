check-code:
	yarn check-code

unit:
	yarn test

test: unit check-code

codegen:
	yarn dev:codegen
	yarn eslint:fix
