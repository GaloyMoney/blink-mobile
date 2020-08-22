import { StyleSheet, TouchableWithoutFeedback, View } from "react-native"
import { Text } from "react-native"
import { Button } from 'react-native-elements';
import * as React from "react"
import { useNavigation } from "@react-navigation/native";
import { StoreContext } from "../../models";
import { validPayment } from "../../utils/parsing";
import { observer } from "mobx-react";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "../../theme/palette";
import { color } from "../../theme";
import Icon from "react-native-vector-icons/Ionicons"
import Modal from "react-native-modal"
import Clipboard from "@react-native-community/clipboard";
import { Token } from "../../utils/token";
import { translate } from "../../i18n";


const styles = StyleSheet.create({
 modalBackground: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-around",
  },

  modalForeground: {
    backgroundColor: palette.white,
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  buttonStyle: {
    backgroundColor: color.primary,
    marginHorizontal: 20,
    marginVertical: 10,
    width: 145,
  },
})

export const ModalClipboard = observer(() => {
  const store = React.useContext(StoreContext)
  const navigation = useNavigation();

  const open = async () => {
    dismiss()
    navigation.navigate("sendBitcoin", { payment: await Clipboard.getString() })
  }

  const dismiss = () => {
    store.setModalClipboardVisible(false)
  }

  return (
    <Modal
      // transparent={true}
      swipeDirection={["down"]}
      isVisible={store?.modalClipboardVisible ?? false} // store is not defined for storybook
      onSwipeComplete={dismiss}
      swipeThreshold={50}
      propagateSwipe={true}
      style={{ marginHorizontal: 0, marginBottom: 0, flexGrow: 1 }}
    >
      <View style={styles.modalBackground}>
        <TouchableWithoutFeedback onPress={dismiss}>
          <View style={{height: "100%", width: "100%"}}></View>
        </TouchableWithoutFeedback>
      </View>
      <SafeAreaView style={styles.modalForeground}>
        <View style={{height: 14}}>
          <Icon name={"ios-remove"}
              size={72}
              color={palette.lightGrey}
              style={{ height: 40, top: -40 }}
            />
        </View>
        <Text style={{fontSize: 18, marginVertical: 8}}>{translate("ModalClipboard.pendingInvoice")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "stretch" }}>
          <Button title="Dismiss" onPress={dismiss} buttonStyle={styles.buttonStyle} />
          <Button title="Open"  onPress={open} buttonStyle={styles.buttonStyle} />
        </View>
      </SafeAreaView>
    </Modal>
)})