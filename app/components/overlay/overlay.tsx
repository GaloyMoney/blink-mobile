import * as React from "react"
import { useState } from "react"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { StyleSheet, View, Modal, SafeAreaView, Text } from "react-native"
import Svg, { Path } from "react-native-svg"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"

const styles = StyleSheet.create({
  modalText: {
    color: palette.white,
    fontSize: 24,
    margin: 30,
  },

  modalTextCenter: {
    color: palette.white,
    textAlign: "center",
    fontSize: 24,
    margin: 30,
  },

  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#000000B0",
  },
})

const SvgComponent = props => {
  return (
    <Svg viewBox="0 0 776.092 693.665" height={150} width={320} {...props}>
      <Path
        d="M28.782 10c3.059 89.23 14.349 170.15 34.519 242.15 19.59 69.929 51.246 124.84 100.094 166.82 141.441 121.543 417.022 51.435 417.022 51.435l-12.595-101.937 198.27 132.773-159.33 182.424-10.468-84.742s-272.851 57.51-445.67-108.263C48.226 392.438 5.716 229.878 10.339 12.797c.723-.767 12.855-2.819 18.443-2.797z"
        clipRule="evenodd"
        fillRule="evenodd"
      />
    </Svg>
  )
}

export const Overlay = ({ screen }) => {
  const [modalVisible, setModalVisible] = useState(true)

  return (
    <Modal visible={modalVisible} transparent={true} animationType={"fade"}>
      <View style={styles.modalBackground}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <SafeAreaView style={{ flex: 1 }}>
            {screen == "accounts" && (
              <>
                <View style={{ flex: 1 }}></View>
                <Text style={styles.modalText}>{translate("Overlay.accounts")}</Text>
                <SvgComponent style={{ marginVertical: 0, marginLeft: 50 }} />
              </>
            )}
            {screen == "rewards" && (
              <>
                <View style={{ flex: 1 }}></View>
                <Text style={styles.modalTextCenter}>{translate("Overlay.rewards")}</Text>
                <View style={{ flex: 1 }}></View>
              </>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  )
}
