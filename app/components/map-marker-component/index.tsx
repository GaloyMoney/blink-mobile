import { useEffect, useRef } from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import {
  Callout,
  CalloutSubview,
  MapMarker as MapMarkerType,
  Marker,
} from "react-native-maps"
import { LocalizedString } from "typesafe-i18n"

import { MapMarker } from "@app/graphql/generated"
import { isIos } from "@app/utils/helper"
import { Text } from "@rneui/themed"

/*
  In order to increase performance, markers are initially rendered without content in the callout.
  Only after being pressed does the content render, and then the callout is shown by a method call
  from the component's ref
*/

type Props = {
  item: MapMarker
  color: string
  handleMarkerPress: (_item: MapMarker, _ref?: MapMarkerType) => void
  handleCalloutPress: (item: MapMarker) => void
  isFocused: boolean
  styles: {
    customView: StyleProp<ViewStyle>
    title: StyleProp<TextStyle>
    text: StyleProp<TextStyle>
    pseudoButton: StyleProp<ViewStyle>
  }
  text: LocalizedString
}

export default function MapMarkerComponent({
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
      id={item.username}
      ref={ref}
      coordinate={item.mapInfo.coordinates}
      pinColor={color}
      onPress={() =>
        handleMarkerPress(item, isIos && ref.current ? ref.current : undefined)
      }
      stopPropagation
    >
      <Callout tooltip={true} onPress={() => handleCalloutPress(item)}>
        {isFocused && (
          <View style={styles.customView}>
            <Text type="h1" style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {item.mapInfo.title}
            </Text>
            {isIos ? (
              <CalloutSubview onPress={() => handleCalloutPress(item)}>
                <View style={styles.pseudoButton}>
                  <Text style={styles.text}>{text}</Text>
                </View>
              </CalloutSubview>
            ) : (
              <View style={styles.pseudoButton}>
                <Text style={styles.text}>{text}</Text>
              </View>
            )}
          </View>
        )}
      </Callout>
    </Marker>
  )
}
