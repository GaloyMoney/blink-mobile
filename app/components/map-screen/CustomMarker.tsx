/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React, { memo } from "react"
import { Linking, View } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { StackNavigationProp } from "@react-navigation/stack"
import { Callout, MapMarkerProps, Marker } from "react-native-maps"
import { Button } from "@rneui/base"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// utils
import { isIos } from "@app/utils/helper"

type Props = {
  blinkData: any
  flashData: any
}

export const CustomMarker: React.FC<Props> = memo(
  ({ blinkData, flashData }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()
    const styles = useStyles()
    const isAuthed = useIsAuthed()
    const { LL } = useI18nContext()
    const { colors } = useTheme().theme

    const maps = [
      ...(blinkData?.businessMapMarkers?.map((item: any) => ({
        ...item,
        source: "blink",
      })) ?? []),
      ...(flashData?.businessMapMarkers?.map((item: any) => ({
        ...item,
        source: "flash",
      })) ?? []),
    ]

    const markers: ReturnType<React.FC<MapMarkerProps>>[] = []
    maps.forEach((item: any, index) => {
      if (item) {
        // Function to open the location in Google Maps
        const openInGoogleMaps = () => {
          if (item.mapInfo.coordinates) {
            const url = `https://www.google.com/maps/search/?api=1&query=${item.mapInfo.coordinates.latitude},${item.mapInfo.coordinates.longitude}`
            Linking.openURL(url)
          }
        }
        const key = item.username + item.mapInfo.title + index
        const onPress = () => {
          const domain = item.source === "blink" ? "@blink.sv" : "@flashapp.me"
          const usernameWithDomain = `${item.username}${domain}`
          if (isAuthed && item?.username) {
            navigation.navigate("sendBitcoinDestination", {
              username: usernameWithDomain,
            })
          } else {
            navigation.navigate("phoneFlow")
          }
        }

        markers.push(
          <Marker
            coordinate={item.mapInfo.coordinates}
            key={key}
            pinColor={colors._orange}
            tracksViewChanges={false}
          >
            <Callout
              onPress={() => (Boolean(item.username) && !isIos ? onPress() : null)}
            >
              <View style={styles.customView}>
                <Text style={styles.title}>{item.mapInfo.title}</Text>
                <Button
                  containerStyle={isIos ? styles.ios : styles.android}
                  title={LL.MapScreen.payBusiness()}
                  onPress={onPress}
                />
                <Button
                  containerStyle={isIos ? styles.ios : styles.android}
                  title={LL.MapScreen.getDirections()}
                  onPress={openInGoogleMaps}
                />
              </View>
            </Callout>
          </Marker>,
        )
      }
    })

    return markers
  },
  (prevProps, nextProps) => {
    return (
      prevProps.flashData === nextProps.flashData &&
      prevProps.blinkData === nextProps.blinkData
    )
  },
)

const useStyles = makeStyles(({ colors }) => ({
  android: {
    marginTop: 18,
    borderRadius: 8,
  },
  ios: { marginTop: 18, borderRadius: 8 },
  customView: {
    alignItems: "center",
    margin: 12,
  },
  title: {
    color: colors._darkGrey,
    fontSize: 18,
  },
}))
