import { isIos } from "@app/utils/helper"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import CenterLocationAndroid from "../../assets/icons/center-location-android.svg"

type Props = {
  requestPermissions: () => void
}

// TODO have iOS version of icon
// TODO have device's dark theme version for each OS

export default function LocationButtonCopy({ requestPermissions }: Props) {
  return (
    <View style={styles.button}>
      <TouchableOpacity
        style={isIos ? styles.ios : styles.android}
        onPress={requestPermissions}
      >
        <CenterLocationAndroid height={22} width={22} fill={"#656565"} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 99,
  },
  ios: {
    borderRadius: 2,
    backgroundColor: "#FFFFFF99",
    padding: 8,
  },
  android: {
    borderRadius: 2,
    backgroundColor: "#FFFFFF99",
    padding: 8,
  },
})
