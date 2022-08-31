import * as React from "react"
import { useState } from "react"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { StyleSheet, View, Modal, SafeAreaView, Text, Dimensions } from "react-native"
import Svg, { Path, Defs, ClipPath, G, Rect, Circle } from "react-native-svg"
import { palette } from "../../theme/palette"
import type { ComponentType } from "../../types/jsx"

import { useI18nContext } from "@app/i18n/i18n-react"

const CY = 200
const R = 135

const styles = StyleSheet.create({
  arrow: {
    marginVertical: 0,
    marginLeft: 50,
  },

  flex: {
    flex: 1,
  },

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
    textAlign: "center",
  },

  modalTextCenter: {
    color: palette.white,
    fontSize: 24,
    margin: 30,
    textAlign: "center",
  },

  screenContainer: {
    position: "absolute",
    zIndex: 2,
  },

  textContainer: {
    position: "absolute",
    top: CY + R,
    alignSelf: "center",
  },
})

const DownArrow = (props) => (
  <Svg viewBox="0 0 776.092 693.665" height={150} width={320} {...props}>
    <Path
      d="M28.782 10c3.059 89.23 14.349 170.15 34.519 242.15 19.59 69.929 51.246 124.84 100.094 166.82 141.441 121.543 417.022 51.435 417.022 51.435l-12.595-101.937 198.27 132.773-159.33 182.424-10.468-84.742s-272.851 57.51-445.67-108.263C48.226 392.438 5.716 229.878 10.339 12.797c.723-.767 12.855-2.819 18.443-2.797z"
      clipRule="evenodd"
      fillRule="evenodd"
      fill="#010002"
    />
  </Svg>
)

type Props = {
  screen: string
}

export const Overlay: ComponentType = ({ screen }: Props) => {
  const [modalVisible, setModalVisible] = useState(true)
  const { LL } = useI18nContext()
  return (
    <Modal visible={modalVisible} transparent animationType="fade">
      {screen === "accounts" && (
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback
            onPress={() => {
              setModalVisible(false)
            }}
          >
            <SafeAreaView style={styles.flex}>
              <View style={styles.flex}>
                <View style={styles.flex} />
                <Text style={styles.modalText}>{LL.Overlay.accounts()}</Text>
                <DownArrow style={styles.arrow} />
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      )}
      {screen === "earns" && (
        <View style={styles.screenContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              setModalVisible(false)
            }}
          >
            <View>
              <Svg
                width={Dimensions.get("window").width}
                height={Dimensions.get("window").height}
              >
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
                  clipPath="url(#clip)"
                  clipRule="evenodd"
                />
              </Svg>
              <View style={styles.textContainer}>
                <Text style={styles.modalText}>{LL.Overlay.rewards.download()}</Text>
                <Text style={styles.modalText}>{LL.Overlay.rewards.getMore()}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </Modal>
  )
}
