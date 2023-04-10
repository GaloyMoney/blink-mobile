import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import * as React from "react"
import { Text, View, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

import Modal from "react-native-modal"
import { useAppConfig } from "@app/hooks"
import { LocalizedString } from "typesafe-i18n"

const styles = StyleSheet.create({
  modalStyle: {
    margin: 0,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  fillerOpacity: {
    flex: 3,
  },
  modalCard: {
    backgroundColor: palette.white,
    flex: 2,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitleText: {
    fontSize: 24,
  },
  iconContainer: {
    marginRight: 12,
  },
  markdownText: {
    fontSize: 20,
    marginBottom: 20,
  },
})

type FloorTooltipProps = {
  size?: number
  type: "info" | "advice"
  title?: string
  text: string
}

export const FloorTooltip: React.FC<FloorTooltipProps> = ({
  size,
  type,
  title,
  text,
}) => {
  const { LL } = useI18nContext()
  const {
    appConfig: {
      galoyInstance: { name: bankName },
    },
  } = useAppConfig()
  const [isVisible, setIsVisible] = React.useState(false)
  const toggleModal = () => setIsVisible(!isVisible)

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
    <View>
      <Icon size={size} {...iconParams} onPress={toggleModal} />
      <Modal
        isVisible={isVisible}
        onBackdropPress={toggleModal}
        coverScreen
        style={styles.modalStyle}
        backdropOpacity={0.2}
      >
        <TouchableOpacity style={styles.fillerOpacity} onPress={toggleModal} />
        <View style={styles.modalCard}>
          <View style={styles.modalTitleContainer}>
            <Icon size={24} {...iconParams} style={styles.iconContainer} />
            <Text style={styles.modalTitleText}>{modalTitle}</Text>
          </View>
          <ScrollView>
            <Text style={styles.markdownText}>{text}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}
