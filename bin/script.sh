# follow https://github.com/lightningnetwork/lnd/blob/master/lnrpc/README.md
# to generate the lib

# script only handle iOS for now

rm -rf ../ios/lightning/Lndmobile.framework
mkdir ../ios/lightning/Lndmobile.framework
cp -R $GOPATH/src/github.com/lightningnetwork/lnd/mobile/build/ios/Lndmobile.framework/ ../ios/lightning/Lndmobile.framework