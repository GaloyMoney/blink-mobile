check-code:
	yarn check-code

unit:
	yarn test

test: unit check-code

codegen:
	./supergraph.sh
	yarn dev:codegen
	yarn update-translations

reset-ios:
	yarn cache:clear
	yarn install
	yarn ios

start:
	yarn start
