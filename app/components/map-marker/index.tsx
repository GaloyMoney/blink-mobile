import {
    Callout,
    CalloutSubview,
    MapMarker as MapMarkerType,
    Marker,
  } from "react-native-maps"
  import { MarkerData } from "../map-interface"
  import { Text } from "@rneui/themed"
  import { useEffect, useRef } from "react"
  import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
  import { isIos } from "@app/utils/helper"
  import { LocalizedString } from "typesafe-i18n"
  
  type Props = {
    item: MarkerData
    color: string
    handleMarkerPress: (item: MarkerData) => void
    handleCalloutPress: (item: MarkerData) => void
    isFocused: boolean
    styles: {
      customView: StyleProp<ViewStyle>
      title: StyleProp<TextStyle>
      text: StyleProp<TextStyle>
      pseudoButton: StyleProp<ViewStyle>
      android: StyleProp<ViewStyle>
      ios: StyleProp<ViewStyle>
    }
    text: LocalizedString
  }
  
  export default function MapMarker({
    item,
    color,
    handleMarkerPress,
    handleCalloutPress,
    isFocused,
    styles,
    text,
  }: Props) {
    const ref = useRef<MapMarkerType>(null)
  
    useEffect(() => {
      if (isFocused && ref.current) {
        ref.current.showCallout()
      }
    }, [isFocused])
  
    return (
      <Marker
        ref={ref}
        coordinate={item.mapInfo.coordinates}
        pinColor={color}
        onPress={() => handleMarkerPress(item)}
        stopPropagation
        pointerEvents="auto"
      >
        <Callout tooltip={true} onPress={() => handleCalloutPress(item)}>
          {isFocused && (
            <View style={styles.customView}>
              <Text type="h1" style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {item.mapInfo.title}
              </Text>
              {isIos ? (
                <CalloutSubview onPress={() => handleCalloutPress(item)}>
                  <View style={[styles.ios, styles.pseudoButton]}>
                    <Text style={styles.text}>{text}</Text>
                  </View>
                </CalloutSubview>
              ) : (
                <View style={[styles.android, styles.pseudoButton]}>
                  <Text style={styles.text}>{text}</Text>
                </View>
              )}
            </View>
          )}
        </Callout>
      </Marker>
    )
  }