import { translateUnknown as translate } from "@galoymoney/client"

import * as React from "react"
import {
  Text,
  View,
} from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { ScreenType } from "../../types/jsx"
import { StackNavigationProp } from "@react-navigation/stack"
import { MoveMoneyStackParamList } from "../../navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"

const styles = EStyleSheet.create({
    modal: { marginBottom: 0, marginHorizontal: 0 },

    cover: { height: "100%", width: "100%" },
    icon: { height: 34, top: -22 },
    buttonStyle: {
      borderColor: color.primary,
      borderRadius: 32,
      borderWidth: 2,
    },
    titleStyle: {
      color: color.primary,
      fontSize: "18rem",
      fontWeight: "bold",
    },

    buttonContainerStyle: {
      marginTop: "16rem",
      width: "80%",
    },
    divider: { flex: 1 },
    flex: {
      flex: 1,
    },
    viewModal: {
      alignItems: "center",
      backgroundColor: palette.white,
      height: "25%",
      justifyContent: "flex-end",
      paddingHorizontal: 20,
    },
    text: {
      color: palette.darkGrey,
      fontSize: "20rem",
      // fontWeight: "bold",
    },
  
    lightningText: {
      fontSize: "16rem",
      marginBottom: 12,
      textAlign: "center",
    },
  })
interface UnAuthModalProps {

    modalVisible: boolean
    setModalVisible: (isVisible: boolean) => void
}

export const UnAuthModal: React.FC<UnAuthModalProps> = ({ 
  modalVisible,
  setModalVisible
}) => { 
    const navigation = useNavigation<StackNavigationProp<MoveMoneyStackParamList, "moveMoney">>()
    const activateWallet = () => {
        setModalVisible(false)
        navigation.navigate("phoneValidation")
      }
  return (
    <Modal
      style={styles.modal}
      isVisible={modalVisible}
      swipeDirection={modalVisible ? ["down"] : ["up"]}
      onSwipeComplete={() => setModalVisible(false)}
      swipeThreshold={50}
    >
      <View style={styles.flex}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.cover} />
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.viewModal}>
        <Icon
          name="ios-remove"
          size={64}
          color={palette.lightGrey}
          style={styles.icon}
        />
        <Text style={styles.text}>{translate("common.needWallet")}</Text>
        <Button
          title={translate("common.openWallet")}
          onPress={activateWallet}
          type="outline"
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          containerStyle={styles.buttonContainerStyle}
        />
        <View style={styles.divider} />
      </View>
    </Modal>
  )
}
