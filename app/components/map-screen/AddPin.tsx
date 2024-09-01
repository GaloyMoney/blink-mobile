import React from "react"
import { View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"

type Props = {
  visible: boolean
}

export const AddPin: React.FC<Props> = ({ visible }) => {
  const { LL } = useI18nContext()
  const styles = useStyles()

  if (visible) {
    return (
      <View style={styles.addPinContainer}>
        <Text style={styles.addPinText}>{LL.MapScreen.addPin()}</Text>
      </View>
    )
  } else {
    return null
  }
}

const useStyles = makeStyles(({ colors }) => ({
  addPinContainer: {
    position: "absolute",
    top: 90,
    opacity: 0.8,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: colors.green,
    zIndex: 1,
  },
  addPinText: {
    color: colors._white,
    fontSize: 18,
  },
}))
