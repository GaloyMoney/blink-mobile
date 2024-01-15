import { makeStyles, useTheme } from "@rneui/themed"
import MapView, { Region, MapMarker as MapMarkerType } from "react-native-maps"
import MapStyles from "./map-styles.json"
import React, { useEffect, useRef } from "react"
import { BusinessMapMarkersQuery, MapMarker } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import MapMarkerComponent from "../map-marker-component"
import { PermissionStatus, RESULTS, check, request } from "react-native-permissions"
import { LOCATION_PERMISSION, getUserRegion } from "@app/screens/map-screen/map-screen"
import LocationButtonCopy from "./location-button-copy"
import debounce from "lodash.debounce"
import { updateMapLastCoords } from "@app/graphql/client-only-query"
import { useApolloClient } from "@apollo/client"
import { OpenSettingsElement, OpenSettingsModal } from "./open-settings-modal"
import { useFocusEffect } from "@react-navigation/native"
import { AppState } from "react-native"
import { isIOS } from "@rneui/base"

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

  const checkIfPermissionsChanged = React.useCallback(() => {
    check(LOCATION_PERMISSION).then(setPermissionsStatus).catch(onError)
  }, [setPermissionsStatus, onError])

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/background/) && nextAppState === "active") {
        checkIfPermissionsChanged()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [checkIfPermissionsChanged])

  const respondToBlocked = (status: PermissionStatus) => {
    // iOS will only ever ask once for permission, and initial checks can differentiate between BLOCKED vs DENIED
    if (isIOS) {
      if (permissionsStatus === RESULTS.BLOCKED && status === RESULTS.BLOCKED) {
        toggleModal()
      }
      // Android can ask twice for permission, and initial checks cannot differentiate between BLOCKED vs DENIED
    } else {
      // TODO figure out how to not fire this after the 2nd time user blocks
      toggleModal()
    }
  }

  const requestLocationPermission = async () => {
    request(LOCATION_PERMISSION)
      .then((status) => {
        if (status === RESULTS.GRANTED) {
          getUserRegion(async (region) => {
            if (region && mapViewRef.current) {
              mapViewRef.current.animateToRegion(region)
            } else {
              onError()
            }
          })
        } else if (status === RESULTS.BLOCKED) {
          respondToBlocked(status)
        }
        setPermissionsStatus(status)
      })
      .catch(() => onError())
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
