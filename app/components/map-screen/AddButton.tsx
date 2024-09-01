import React from "react"
import { TouchableOpacity } from "react-native"
import { makeStyles, useTheme } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"

// hooks
import { useLevel } from "@app/graphql/level-context"

// utils
import { toastShow } from "@app/utils/toast"

type Props = {
  handleOnPress: (val: boolean) => void
}

export const AddButton: React.FC<Props> = ({ handleOnPress }) => {
  const { currentLevel: level } = useLevel()
  const { colors } = useTheme().theme
  const styles = useStyles()

  const handleAddPin = () => {
    handleOnPress(true)
    toastShow({
      message: "Press anywhere on the screen to select a location to add.",
      type: "success",
    })
  }

  if (level === "TWO") {
    return (
      <TouchableOpacity style={styles.addButton} onPress={handleAddPin}>
        <Icon name="add" size={50} color={colors.white} />
      </TouchableOpacity>
    )
  } else {
    return null
  }
}

const useStyles = makeStyles(({ colors }) => ({
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    height: 60,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    backgroundColor: colors.green,
    zIndex: 1,
  },
}))
