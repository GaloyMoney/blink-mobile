import { TouchableOpacity, View } from "react-native"
import CenterLocationAndroid from "../../assets/icons/center-location-android.svg"
import { makeStyles } from "@rneui/themed"

type Props = {
  requestPermissions: () => void
}

// TODO have iOS version of icon
// TODO have device's dark theme version for each OS

export default function LocationButtonCopy({ requestPermissions }: Props) {
  const styles = useStyles()

  return (
    <View style={styles.button}>
      <TouchableOpacity style={styles.android} onPress={requestPermissions}>
        <CenterLocationAndroid height={22} width={22} fill={"#656565"} />
      </TouchableOpacity>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  button: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 99,
  },
  android: {
    borderRadius: 2,
    opacity: 0.99,
    backgroundColor: colors.white,
    padding: 8,
  },
}))
