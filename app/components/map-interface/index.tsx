import { makeStyles, useTheme } from "@rneui/themed"
import MapView, { Region } from "react-native-maps"
import MapStyles from "./map-styles.json"
import React, { useRef } from "react"
import { BusinessMapMarkersQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import MapMarker from "../map-marker"

type Props = {
  data?: BusinessMapMarkersQuery
  userLocation?: Region
  handleMapPress: () => void
  handleMarkerPress: (_: MarkerData) => void
  focusedMarker: MarkerData | null
  handleCalloutPress: (_: MarkerData) => void
}

export type MarkerData = {
  readonly __typename: "MapMarker"
  readonly username?: string | null | undefined
  readonly mapInfo: {
    readonly __typename: "MapInfo"
    readonly title: string
    readonly coordinates: {
      readonly __typename: "Coordinates"
      readonly longitude: number
      readonly latitude: number
    }
  }
}

export default function MapInterface({
  data,
  userLocation,
  handleMapPress,
  handleMarkerPress,
  focusedMarker,
  handleCalloutPress,
}: Props) {
  const {
    theme: { colors, mode: themeMode },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const text = React.useMemo(() => LL.MapScreen.payBusiness(), [LL.MapScreen])

  const mapViewRef = useRef<MapView>(null)

  return (
    <MapView
      ref={mapViewRef}
      style={styles.map}
      showsUserLocation={true}
      initialRegion={userLocation}
      customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
      onPress={handleMapPress}
    >
      {(data?.businessMapMarkers ?? []).reduce(
        (arr: React.ReactElement[], item: MarkerData | null) => {
          if (item?.username) {
            arr.push(
              <MapMarker
                key={item.username}
                item={item}
                color={colors._orange}
                handleCalloutPress={handleCalloutPress}
                handleMarkerPress={handleMarkerPress}
                isFocused={focusedMarker?.username === item.username}
                text={text}
                styles={styles}
              />,
            )
          }

          return arr
        },
        [] as React.ReactElement[],
      )}
    </MapView>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  android: {
    marginTop: 15,
    backgroundColor: colors._orange,
  },

  customView: {
    alignItems: "center",
    margin: 12,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.grey4,
  },

  pseudoButton: {
    minHeight: 50,
    backgroundColor: colors.primary3,
    borderRadius: 25,
    justifyContent: "center",
    elevation: 4,
    width: 200,
  },

  ios: { paddingTop: 12 },

  map: {
    height: "100%",
    width: "100%",
  },

  title: { color: colors._darkGrey },

  text: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
    color: colors.white,
    margin: 8,
    textAlign: "center",
  },
}))