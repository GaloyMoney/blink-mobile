import { makeStyles, useTheme } from "@rneui/themed"
import MapView, { Marker, Region } from "react-native-maps"
import MapStyles from "./map-styles.json"
import React, { useRef } from "react"
import { BusinessMapMarkersQuery } from "@app/graphql/generated"

type Props = {
  data?: BusinessMapMarkersQuery
  userLocation?: Region
  bottomPadding: number
  handleMapPress: () => void
  handleMarkerPress: (_: MarkerData) => void
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
  bottomPadding,
  handleMapPress,
  handleMarkerPress,
  handleCalloutPress,
}: Props) {
  const {
    theme: { colors, mode: themeMode },
  } = useTheme()
  const styles = useStyles()

  const mapViewRef = useRef<MapView>(null)

  return (
    <MapView
      ref={mapViewRef}
      style={styles.map}
      showsUserLocation={true}
      initialRegion={userLocation}
      customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
      onPress={handleMapPress}
      mapPadding={{ bottom: bottomPadding, top: 0, right: 0, left: 0 }}
    >
      {(data?.businessMapMarkers ?? []).reduce(
        (arr: React.ReactElement[], item: MarkerData | null, i: number) => {
          if (item?.username) {
            const marker = (
              <Marker
                coordinate={item.mapInfo.coordinates}
                key={item.username}
                pinColor={colors._orange}
                title={item.mapInfo.title}
                onPress={() => handleMarkerPress(item)}
                onCalloutPress={() => handleCalloutPress(item)}
                stopPropagation
                pointerEvents="auto"
              />
            )
            arr.push(marker)
          }

          return arr
        },
        [] as React.ReactElement[],
      )}
    </MapView>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  map: {
    flex: 1,
  },

  customView: {
    alignItems: "center",
    margin: 12,
    height: 30,
    width: "100%",
  },

  title: { color: colors._darkGrey },
}))

// -------- uncomment if using boundingBox ----------- //

// const { latitude, longitude } = item.mapInfo.coordinates
// const isInView: boolean =
//   latitude < boundingBox.northEast.latitude &&
//   latitude > boundingBox.southWest.latitude &&
//   longitude > boundingBox.southWest.longitude &&
//   longitude < boundingBox.northEast.longitude
