import { makeStyles, useTheme } from "@rneui/themed"
import MapView, { Marker, Region } from "react-native-maps"
import MapStyles from "./map-styles.json"
import React from "react"
import { BusinessMapMarkersQuery } from "@app/graphql/generated"

type Props = {
  data?: BusinessMapMarkersQuery
  userLocation?: Region
  handleMarkerPress: (_: MarkerData) => void
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

export default function MapInterface({ data, userLocation, handleMarkerPress }: Props) {
  const {
    theme: { colors, mode: themeMode },
  } = useTheme()
  const styles = useStyles()

  return (
    <MapView
      style={styles.map}
      showsUserLocation={true}
      initialRegion={userLocation}
      loadingEnabled
      customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
    >
      {(data?.businessMapMarkers ?? []).reduce(
        (arr: React.ReactElement[], item: MarkerData | null) => {
          if (item?.username) {
            const marker = (
              <Marker
                coordinate={item.mapInfo.coordinates}
                key={item.username}
                pinColor={colors._orange}
                title={item.mapInfo.title}
                onCalloutPress={() => handleMarkerPress(item)}
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
    height: "100%",
    width: "100%",
  },
  android: { marginTop: 18 },

  customView: {
    alignItems: "center",
    margin: 12,
    height: 30,
    width: "100%",
  },

  ios: { paddingTop: 12 },

  title: { color: colors._darkGrey },
}))

// --- might use this (in the reduce func) one day if there are so many markers being loaded at once that it's simply not reasonable ---
// --- this would then be part of the puzzle for loading only the map markers in the boundingBox ---

// const { latitude, longitude } = item.mapInfo.coordinates
// const isInView: boolean =
//   latitude < boundingBox.northEast.latitude &&
//   latitude > boundingBox.southWest.latitude &&
//   longitude > boundingBox.southWest.longitude &&
//   longitude < boundingBox.northEast.longitude
