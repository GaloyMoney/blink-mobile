
/*
* recursive function that will return what is the key of the current screen
*/
export const currentScreen = obj => {
    if (obj["index"]) {
        return currentScreen(obj["routes"][obj["index"]])
    } else {
        return obj["routeName"]
    }
}