import { makeStyles, useTheme } from "@rneui/themed"
import MapView, { Region, MapMarker as MapMarkerType, LatLng } from "react-native-maps"
import MapStyles from "./map-styles.json"
import React, { useEffect, useRef, useState } from "react"
import { BusinessMapMarkersQuery, MapMarker } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import MapMarkerComponent from "../map-marker-component"
import {
  PERMISSIONS,
  PermissionStatus,
  RESULTS,
  Rationale,
  check,
  request,
} from "react-native-permissions"
import { isIos } from "@app/utils/helper"
import { LOCATION_PERMISSION, getUserRegion } from "@app/screens/map-screen/map-screen"
import LocationButtonCopy from "./location-button-copy"
import debounce from "lodash.debounce"
import { updateMapLastCoords } from "@app/graphql/client-only-query"
import { useApolloClient } from "@apollo/client"
import { OpenSettingsElement, OpenSettingsModal } from "./open-settings-modal"
import { useFocusEffect } from "@react-navigation/native"
import { AppState } from "react-native"

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

  onError: () => void
}

const PERMISSIONS_RATIONALE: Rationale = {
  title: "Request location",
  message: "Test",
  buttonPositive: "test",
  buttonNegative: "test",
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
  onError,
}: Props) {
  const {
    theme: { colors, mode: themeMode },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const client = useApolloClient()
  const text = React.useMemo(() => LL.MapScreen.payBusiness(), [LL.MapScreen])

  const appState = useRef(AppState.currentState)
  const mapViewRef = useRef<MapView>(null)
  const openSettingsModalRef = React.useRef<OpenSettingsElement>(null)

  // toggle modal from inside modal component instead of here in the parent
  const toggleModal = React.useCallback(
    () => openSettingsModalRef.current?.toggleVisibility(),
    [],
  )

  useFocusEffect(() => {
    checkIfPermissionsChanged()
  })

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/background/) && nextAppState === "active") {
        checkIfPermissionsChanged()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const checkIfPermissionsChanged = () => {
    check(LOCATION_PERMISSION).then(setPermissionsStatus).catch(onError)
  }

  const requestLocationPermission = () => {
    request(LOCATION_PERMISSION)
      .then((status) => {
        console.log("Permissions after request: ", status);
        setPermissionsStatus(status)
        if (status === RESULTS.GRANTED) {
          getUserRegion(async (region) => {
            if (region && mapViewRef.current) {
              mapViewRef.current.animateToRegion(region)
            } else {
              onError()
            }
          })
          // TODO figure out how to not fire this on user declaring 'Never ask again' on Android
          // some Android phones do this automatically on the 2nd time they say press 'Don't allow'
        } else if (status === RESULTS.BLOCKED) {
          toggleModal()
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
      {(permissionsStatus === RESULTS.DENIED ||
        permissionsStatus === RESULTS.BLOCKED) && (
        <LocationButtonCopy requestPermissions={requestLocationPermission} />
      )}
      <OpenSettingsModal ref={openSettingsModalRef} />
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
