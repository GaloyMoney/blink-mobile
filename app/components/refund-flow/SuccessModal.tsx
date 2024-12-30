import React from "react"
import { Linking, TouchableOpacity, View } from "react-native"
import Modal from "react-native-modal"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// components
import { GaloyIcon } from "../atomic/galoy-icon"
import { SuccessIconAnimation } from "../success-animation"

// hooks
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"

type Props = {
  txId?: string
  isVisible: boolean
  setIsVisible: (val: boolean) => void
}

const SuccessModal: React.FC<Props> = ({ txId, isVisible, setIsVisible }) => {
  const styles = useStyles()
  const { colors } = useTheme().theme
  const { galoyInstance } = useAppConfig().appConfig
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const onPress = () => {
    Linking.openURL(galoyInstance.blockExplorer + txId)
  }

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.5}
      backdropColor={colors.black}
      animationIn={"bounceIn"}
      animationOut={"fadeOut"}
      onModalHide={() => navigation.popToTop()}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.close} onPress={() => setIsVisible(false)}>
          <GaloyIcon name="close" size={30} />
        </TouchableOpacity>
        <SuccessIconAnimation>
          <GaloyIcon name={"payment-success"} size={128} />
        </SuccessIconAnimation>
        {!!txId && (
          <>
            <Text style={styles.title}>{LL.RefundFlow.txId()}</Text>
            <TouchableOpacity style={styles.textBtn} onPress={onPress}>
              <Text style={styles.text}>{txId}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  )
}

export default SuccessModal

const useStyles = makeStyles(({ colors }) => ({
  container: {
    height: "50%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  close: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  title: {
    marginTop: 50,
  },
  textBtn: {
    marginTop: 5,
    marginHorizontal: 30,
  },
  text: {
    textAlign: "center",
    color: "#60aa55",
  },
}))
