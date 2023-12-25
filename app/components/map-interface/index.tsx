import { makeStyles, useTheme } from "@rneui/themed"
import MapView, { LatLng, MapMarker, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps"
import MapStyles from "./map-styles.json"
import React, { MutableRefObject, createRef, useEffect, useRef, useState } from "react"
import { BusinessMapMarkersQuery } from "@app/graphql/generated"
import { Platform, View } from "react-native"

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

  const [elementRefs, setElementRefs] = useState<MutableRefObject<unknown>[]>()

  useEffect(() => {
    if (data?.businessMapMarkers && Platform.OS === "ios") {
      setElementRefs((data?.businessMapMarkers ?? []).map(() => createRef()))
    }
  }, [data?.businessMapMarkers])

  const mapViewRef = useRef<MapView>(null)
  const pressedMarkerRef = useRef<React.ReactElement<typeof MapMarker>>()
  const pressedMarkerCoord = useRef<LatLng>()

  if (Platform.OS === "ios" && !elementRefs) return <View />

  return (
    <MapView
      ref={mapViewRef}
      style={styles.map}
      showsUserLocation={true}
      initialRegion={userLocation}
      loadingEnabled
      customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
      onPress={handleMapPress}
      mapPadding={{ bottom: bottomPadding, top: 0, right: 0, left: 0 }}
    >
      {(data?.businessMapMarkers ?? []).reduce(
        (arr: React.ReactElement[], item: MarkerData | null, i: number) => {
          if (item?.username) {
            const thisRef = elementRefs[i]
            const marker = (
              <Marker
                ref={thisRef}
                coordinate={item.mapInfo.coordinates}
                key={item.username}
                pinColor={colors._orange}
                title={item.mapInfo.title}
                onPress={(e) => {
                  // TODO i think the coords are unique but I'm not positive. Better to access the username or something definitely unique from the marker being pressed
                  console.log("PRESSING", e.nativeEvent.coordinate)
                  pressedMarkerRef.current = thisRef
                  pressedMarkerCoord.current = e.nativeEvent.coordinate
                  handleMarkerPress(item)
                }}
                onCalloutPress={() => handleCalloutPress(item)}
                onSelect={(e) => {
                  if (
                    pressedMarkerCoord.current?.latitude !==
                      e.nativeEvent.coordinate.latitude ||
                    pressedMarkerCoord.current?.longitude !==
                      e.nativeEvent.coordinate.longitude
                  ) {
                    console.log("SELECTING WRONG", e.nativeEvent.coordinate)

                    console.log("Saved ref?", pressedMarkerRef.current.current)
                    pressedMarkerRef.current.current.showCallout()
                    // const children = mapViewRef.current?.props?.children
                    // if (children && isArray(children)) {
                    //   const firstChild = children[0]
                    //   console.log("Child looks like: ", firstChild)
                    // }
                  }

                  handleMarkerPress(item)
                }}
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

// --- might use this (in the reduce func) one day if there are so many markers being loaded at once that it's simply not reasonable ---
// --- this would then be part of the puzzle for loading only the map markers in the boundingBox ---

// const { latitude, longitude } = item.mapInfo.coordinates
// const isInView: boolean =
//   latitude < boundingBox.northEast.latitude &&
//   latitude > boundingBox.southWest.latitude &&
//   longitude > boundingBox.southWest.longitude &&
//   longitude < boundingBox.northEast.longitude
