# save the stack trace to a file and then run this script
# example call `sympolicate-trace.sh android 2.0.51 /path/to/trace.txt`

# Download source map using platform and version
if [ $1 == "ios" ]
then
    source_map=$2.main.jsbundle.map
    if ! [ -f "$source_map" ]
    then
        curl -L https://github.com/GaloyMoney/galoy-mobile/releases/download/$2/main.jsbundle.map -o $source_map -s
    fi
elif [ $1 == "android" ]
then
    source_map=$2.index.android.bundle.map
    if ! [ -f "$source_map" ]
    then
        curl -L https://github.com/GaloyMoney/galoy-mobile/releases/download/$2/index.android.bundle.map -o $source_map -s
    fi
fi

# Check if source map is populated
if [ $(wc -c < $source_map) -lt 50 ]
then
    echo "Failed to download source map"
    exit
fi

# Print new stack trace
sed 's/0:0//' $3 | npx metro-symbolicate "$source_map"
