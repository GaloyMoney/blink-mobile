import { isIos } from "@app/utils/helper"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import CenterLocationAndroid from "../../assets/icons/center-location-android.svg"

type Props = {
  requestPermissions: () => void
}

export default function LocationButtonCopy({ requestPermissions }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, isIos ? styles.ios : styles.android]}
      onPress={requestPermissions}
    >
      <CenterLocationAndroid height={22} width={22} fill={"#656565"} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 99,
  },
  // TODO change to iOS design
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
