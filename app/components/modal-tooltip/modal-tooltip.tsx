import { useI18nContext } from "@app/i18n/i18n-react"
import * as React from "react"
import { View, TouchableOpacity, ScrollView } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import Modal from "react-native-modal"
import { useAppConfig } from "@app/hooks"
import { LocalizedString } from "typesafe-i18n"
import { Text, makeStyles, useTheme } from "@rneui/themed"

type ModalTooltipProps = {
  size?: number
  type: "info" | "advice"
  title?: string
  text: string
}

export const ModalTooltip: React.FC<ModalTooltipProps> = ({
  size,
  type,
  title,
  text,
}) => {
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()
  const {
    appConfig: {
      galoyInstance: { name: bankName },
    },
  } = useAppConfig()
  const [isVisible, setIsVisible] = React.useState(false)
  const toggleModal = () => setIsVisible(!isVisible)
  const styles = useStyles()

  let iconParams: { name: string; type: string }
  let defaultTitle: LocalizedString
  switch (type) {
    case "info":
      iconParams = {
        name: "information-circle-outline",
        type: "ionicons",
      }
      defaultTitle = LL.common.bankInfo({ bankName })
      break
    case "advice":
      iconParams = {
        name: "bulb-outline",
        type: "ionicon",
      }
      defaultTitle = LL.common.bankAdvice({ bankName })
      break
  }
  const modalTitle = title || defaultTitle

  return (
    <>
      <Icon
        color={type === "info" ? colors.black : colors.error5}
        size={size}
        {...iconParams}
        onPress={toggleModal}
      />
      <Modal
        isVisible={isVisible}
        onBackdropPress={toggleModal}
        coverScreen
        style={styles.modalStyle}
        backdropOpacity={0.3}
        backdropColor={colors.grey3}
      >
        <TouchableOpacity style={styles.fillerOpacity} onPress={toggleModal} />
        <View style={styles.modalCard}>
          <View style={styles.modalTitleContainer}>
            <Icon size={24} {...iconParams} style={styles.iconContainer} />
            <Text type={"h1"}>{modalTitle}</Text>
          </View>
          <ScrollView>
            <Text type={"p1"}>{text}</Text>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  modalStyle: {
    margin: 0,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  fillerOpacity: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: colors.white,
    maxFlex: 2,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    color: colors.black,
    marginRight: 12,
  },
}))
