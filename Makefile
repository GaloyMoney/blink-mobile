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

tilt-up:
	cd dev && tilt up

tilt-down:
	cd dev && tilt down

emulator:
	emulator -avd Pixel_API_34 -gpu swiftshader -wipe-data -no-boot-anim

reset-e2e:
	tilt trigger dev-setup
	tilt wait --timeout 5m --for=condition=Ready uiresources dev-setup
