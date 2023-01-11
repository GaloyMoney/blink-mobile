check-code:
	yarn check-code
	yarn prettier:check

unit:
	yarn test

test: unit check-code

gen:
	yarn dev:codegen
	yarn prettier:fix
