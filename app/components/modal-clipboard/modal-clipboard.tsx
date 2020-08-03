import { Modal, StyleSheet, View } from "react-native"
import { Text } from "react-native-svg"
import { Button } from 'react-native-elements';
import * as React from "react"
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
 modalBackground: {
    alignItems: "center",
    backgroundColor: "#00000040",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  }
})

export const ModalClipboard = ({modalVisible, setModalVisible, invoice, amount, amountless, note}) => {

  const { navigate } = useNavigation()

  return (
    <Modal
      transparent={true}
      animationType={"none"}
      visible={modalVisible}
      onRequestClose={() => {
        console.tron.log("close modal")
      }}
    >
      <View style={styles.modalBackground}>
        <Text>You have a Lightning Invoice in your clipboard</Text>
        <View style={{flexDirection: "column"}}>
          <Button title="Dismiss" onPress={() => setModalVisible(false)} />
          <Button title="Open"  onPress={() => navigate("sendBitcoin", { invoice, amount, amountless, note })} />
        </View>
      </View>
    </Modal>
  )}