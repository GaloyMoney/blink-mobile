import * as React from "react"
import { Text, View } from "react-native"
import { Button } from "@rneui/base"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { makeStyles } from "@rneui/themed"

type Props = {
  modalVisible: boolean
  setModalVisible: (isOpen: boolean) => void
}

// The same modal used in move-money-screen.tsx
export const UnAuthModal = ({ modalVisible, setModalVisible }: Props) => {
  const { LL } = useI18nContext()

  const navigation = useNavigation<any>()

  const activateWallet = () => {
    setModalVisible(false)
    navigation.navigate("phoneFlow")
  }

  const styles = useStyles()

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
        <Icon name="ios-remove" size={64} color={palette.lightGrey} style={styles.icon} />
        <Text style={styles.text}>{LL.common.needWallet()}</Text>
        <Button
          title={LL.common.openWallet()}
          onPress={activateWallet}
          type="outline"
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          containerStyle={styles.buttonContainerStyle}
        />
        <View style={styles.flex} />
      </View>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollView: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  tintColor: {
    color: colors.primary,
  },
  listItemsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    marginHorizontal: 30,
    borderRadius: 12,
    backgroundColor: colors.whiteOrDarkGrey,
  },
  listItems: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  background: {
    color: colors.lighterGreyOrBlack,
  },
  buttonContainerStyle: {
    marginTop: 16,
    width: "80%",
  },
  noTransaction: {
    alignItems: "center",
  },
  text: {
    color: colors.grey5,
    fontSize: 20,
  },
  titleStyle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    height: 34,
    top: -22,
  },
  buttonStyle: {
    borderColor: colors.primary,
    borderRadius: 32,
    borderWidth: 2,
  },
  modal: {
    marginBottom: 0,
    marginHorizontal: 0,
  },
  flex: {
    flex: 1,
  },
  cover: {
    height: "100%",
    width: "100%",
  },
  viewModal: {
    alignItems: "center",
    backgroundColor: colors.white,
    height: "25%",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
  recentTransaction: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 10,
    backgroundColor: colors.whiteOrDarkGrey,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderColor: colors.lighterGreyOrBlack,
    borderBottomWidth: 2,
    paddingVertical: 14,
  },
  transactionContainer: {
    marginHorizontal: 30,
  },
  largeButton: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 60,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 30,
    height: 120,
  },
  topButton: {
    backgroundColor: colors.whiteOrDarkGrey,
    borderRadius: 38,
    width: 45,
    height: 45,
  },
  balanceHeaderContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  error: {
    alignSelf: "center",
    color: colors.error,
  },
}))
