import { View } from "react-native"
import { Callout, CalloutSubview, Marker } from "react-native-maps"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { MarkerData } from "@app/screens/map-screen/map-screen"
import { isIos } from "../../utils/helper"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { useI18nContext } from "@app/i18n/i18n-react"

type Props = {
  item: MarkerData
  onPress: (item: MarkerData) => void
}

export default function MapMarker({ item, onPress }: Props) {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()

  return (
    <Marker
      coordinate={item.mapInfo.coordinates}
      key={item.username}
      pinColor={colors._orange}
    >
      <Callout onPress={() => (item?.username && !isIos ? onPress(item) : null)}>
        <View style={styles.customView}>
          <Text type="h1" style={styles.title}>
            {item.mapInfo.title}
          </Text>
          {Boolean(item.username) &&
            (isIos ? (
              <CalloutSubview onPress={() => onPress(item)}>
                <GaloyPrimaryButton
                  style={styles.ios}
                  title={LL.MapScreen.payBusiness()}
                />
              </CalloutSubview>
            ) : (
              <GaloyPrimaryButton
                containerStyle={styles.android}
                title={LL.MapScreen.payBusiness()}
              />
            ))}
        </View>
      </Callout>
    </Marker>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  android: { marginTop: 18 },

  customView: {
    alignItems: "center",
    margin: 12,
  },

  ios: { paddingTop: 12 },

  title: { color: colors._darkGrey },
}))
