import React from "react"
import { StyleSheet, View, Modal, ActivityIndicator } from "react-native"
import { color } from "../../theme"

export const Loader = ({ loading }) => {
  return (
    <Modal
      transparent={true}
      animationType={"none"}
      visible={loading}
      onRequestClose={() => {
        console.log("close modal")
      }}
    >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator animating={loading} size="large" color={color.primary} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  activityIndicatorWrapper: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    display: "flex",
    height: 100,
    justifyContent: "space-around",
    width: 100,
  },
  modalBackground: {
    alignItems: "center",
    backgroundColor: "#00000040",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },
})
