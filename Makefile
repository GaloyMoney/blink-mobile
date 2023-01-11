check-code:
	yarn check-code

unit:
	yarn test

test: unit check-code

gen:
	yarn dev:codegen
	yarn prettier:fix
