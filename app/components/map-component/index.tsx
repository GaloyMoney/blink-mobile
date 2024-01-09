import { makeStyles, useTheme } from "@rneui/themed"
import MapView, { Region, MapMarker as MapMarkerType, LatLng } from "react-native-maps"
import MapStyles from "./map-styles.json"
import React, { useRef } from "react"
import { BusinessMapMarkersQuery, MapMarker } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import MapMarkerComponent from "../map-marker-component"
import { PERMISSIONS, PermissionStatus, RESULTS, request } from "react-native-permissions"
import { isIos } from "@app/utils/helper"
import { getUserRegion } from "@app/screens/map-screen/map-screen"
import LocationButtonCopy from "./location-button-copy"
import debounce from "lodash.debounce"
import { updateMapLastCoords } from "@app/graphql/client-only-query"
import { useApolloClient } from "@apollo/client"

type Props = {
  data?: BusinessMapMarkersQuery
  userLocation?: Region
  permissionsStatus?: PermissionStatus
  setPermissionsStatus: (_: PermissionStatus) => void
  handleMapPress: () => void
  handleMarkerPress: (_: MapMarker) => void
  focusedMarker: MapMarker | null
  focusedMarkerRef: React.MutableRefObject<MapMarkerType | null>
  handleCalloutPress: (_: MapMarker) => void
  mostRecentCoordsRef: React.MutableRefObject<LatLng | undefined>
  onError: () => void
}

export default function MapComponent({
  data,
  userLocation,
  permissionsStatus,
  setPermissionsStatus,
  handleMapPress,
  handleMarkerPress,
  focusedMarker,
  focusedMarkerRef,
  handleCalloutPress,
  mostRecentCoordsRef,
  onError,
}: Props) {
  const {
    theme: { colors, mode: themeMode },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const client = useApolloClient()
  const text = React.useMemo(() => LL.MapScreen.payBusiness(), [LL.MapScreen])

  const mapViewRef = useRef<MapView>(null)

  const requestLocationPermission = () => {
    request(
      isIos
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    )
      .then((status) => {
        setPermissionsStatus(status)
        if (status === RESULTS.GRANTED) {
          getUserRegion(async (region) => {
            if (region && mapViewRef.current) {
              mapViewRef.current.animateToRegion(region)
            } else {
              onError()
            }
          })
        } else if (!isIos && status === RESULTS.BLOCKED) {
          alert(LL.MapScreen.locationPermissionBlockedAndroid())
        }
      })
      .catch((_) => onError())
  }

  const debouncedHandleRegionChange = React.useRef(
    debounce(
      (region: Region) => {
        updateMapLastCoords(client, {
          latitude: region.latitude,
          longitude: region.longitude,
        })
      },
      1000,
      { trailing: true },
    ),
  ).current

  return (
    <>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        // we don't want MapView to ever ask for permissions directly,
        // but we do want to take advantage of their 'center-location' button that comes from this prop
        showsUserLocation={permissionsStatus === RESULTS.GRANTED}
        initialRegion={userLocation}
        customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
        onPress={handleMapPress}
        onRegionChange={debouncedHandleRegionChange}
        onMarkerSelect={(e) => {
          // react-native-maps has a very annoying error on iOS
          // When two markers are almost on top of each other onSelect will get called for a nearby Marker
          // This improvement (not an optimal fix) checks to see if that error happened, and quickly reopens the correct callout
          const matchingLat =
            e.nativeEvent.coordinate.latitude ===
            focusedMarker?.mapInfo.coordinates.latitude
          const matchingLng =
            e.nativeEvent.coordinate.longitude ===
            focusedMarker?.mapInfo.coordinates.longitude
          if (!matchingLat || !matchingLng) {
            if (focusedMarkerRef.current) {
              focusedMarkerRef.current.showCallout()
            }
          }
        }}
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
      {permissionsStatus === RESULTS.DENIED && (
        <LocationButtonCopy requestPermissions={requestLocationPermission} />
      )}
    </>
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
