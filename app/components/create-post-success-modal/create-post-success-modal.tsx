import { useNavigation } from "@react-navigation/native"
import * as React from "react"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Modal from "react-native-modal"

import { color, fontSize, typography } from "../../theme"
import { palette } from "../../theme/palette"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import CompleteSvg from "@asset/svgs/complete.svg"
import XSvg from "@asset/svgs/x.svg"
const { width, height } = Dimensions.get("window")
const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

export const CreatePostSuccessModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      // transparent={true}
      swipeDirection={["down"]}
      isVisible={isVisible}
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      swipeThreshold={50}
      propagateSwipe
      style={styles.modal}
    >
      <View
        style={{
          width: width - 25 * 2,
          padding: 15,
          borderRadius: 11,
          backgroundColor: "white",
          height: height / 3,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#ECEDFF",
            width: 30,
            height: 30,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "flex-end",
          }}
          onPress={onClose}
        >
          <XSvg />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: fontSize.font24,
            fontFamily: typography.regular,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Your post is submitted to review
        </Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={onClose}>
          <CompleteSvg />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>
    </Modal>
  )
}
