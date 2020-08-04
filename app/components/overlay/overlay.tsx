import * as React from "react"
import { useState } from "react"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { StyleSheet, View, Modal, SafeAreaView, Text, Dimensions } from "react-native"
import Svg, { Path, Defs, ClipPath, G, Rect, Circle } from "react-native-svg"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"

const styles = StyleSheet.create({
  modalBackground: {
    alignItems: "center",
    backgroundColor: palette.OPACITY,
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },

  modalText: {
    color: palette.white,
    fontSize: 24,
    margin: 30,
  },

  modalTextCenter: {
    color: palette.white,
    fontSize: 24,
    margin: 30,
    textAlign: "center",
  },
})

const DownArrow = (props) => {
  return (
    <Svg viewBox="0 0 776.092 693.665" height={150} width={320} {...props}>
      <Path
        d="M28.782 10c3.059 89.23 14.349 170.15 34.519 242.15 19.59 69.929 51.246 124.84 100.094 166.82 141.441 121.543 417.022 51.435 417.022 51.435l-12.595-101.937 198.27 132.773-159.33 182.424-10.468-84.742s-272.851 57.51-445.67-108.263C48.226 392.438 5.716 229.878 10.339 12.797c.723-.767 12.855-2.819 18.443-2.797z"
        clipRule="evenodd"
        fillRule="evenodd"
        fill="#010002"
      />
    </Svg>
  )
}

const CY = 200
const R = 135

export const Overlay = ({ screen }) => {
  const [modalVisible, setModalVisible] = useState(true)

  return (
    <Modal visible={modalVisible} transparent={true} animationType={"fade"}>
      {screen == "accounts" && (
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback
            onPress={() => {
              setModalVisible(false)
            }}
          >
            <SafeAreaView style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}></View>
                <Text style={styles.modalText}>{translate("Overlay.accounts")}</Text>
                <DownArrow style={{ marginVertical: 0, marginLeft: 50 }} />
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      )}
      {screen == "earns" && (
        <View style={{ position: "absolute", zIndex: 2 }}>
          <TouchableWithoutFeedback
            onPress={() => {
              setModalVisible(false)
            }}
          >
            <View>
              <Svg width={Dimensions.get("window").width} height={Dimensions.get("window").height}>
                <Defs>
                  <ClipPath id="clip">
                    <G>
                      <Rect width="100%" height="100%" />
                      <Circle cx={Dimensions.get("window").width / 2} cy={CY} r={R} />
                    </G>
                  </ClipPath>
                </Defs>
                <Rect
                  width="100%"
                  height="100%"
                  fill={OPACITY}
                  clipPath="url(#clip)"
                  clipRule="evenodd"
                />
              </Svg>
              <View style={{ position: "absolute", top: CY + R, alignSelf: "center" }}>
                <Text style={[styles.modalText, { textAlign: "center" }]}>
                  {translate("Overlay.earns.download")}
                </Text>
                <Text style={[styles.modalText, { textAlign: "center" }]}>
                  {translate("Overlay.earns.getMore")}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </Modal>
  )
}
