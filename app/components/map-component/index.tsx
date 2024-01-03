import { makeStyles, useTheme } from "@rneui/themed"
import MapView, { Region } from "react-native-maps"
import MapStyles from "./map-styles.json"
import React, { useRef } from "react"
import { BusinessMapMarkersQuery, MapMarker } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import MapMarkerComponent from "../map-marker-component"

type Props = {
  data?: BusinessMapMarkersQuery
  userLocation?: Region
  handleMapPress: () => void
  handleMarkerPress: (_: MapMarker) => void
  focusedMarker: MapMarker | null
  handleCalloutPress: (_: MapMarker) => void
}

export default function MapComponent({
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
        (arr: React.ReactElement[], item: MapMarker | null) => {
          if (item?.username) {
            arr.push(
              <MapMarkerComponent
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
        [],
      )}
    </MapView>
  )
}

const useStyles = makeStyles(({ colors }) => ({
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
    marginTop: 15,
    minHeight: 50,
    backgroundColor: colors.primary3,
    borderRadius: 25,
    justifyContent: "center",
    elevation: 4,
    width: 200,
  },

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
