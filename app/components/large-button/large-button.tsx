import * as React from "react"
import { ListItem } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "../../theme/palette"
import { StyleProp, ViewStyle } from "react-native"
import { useDarkMode } from "@app/hooks/use-darkmode"

const styles = EStyleSheet.create({
  accountView: {
    marginHorizontal: "30rem",
    marginTop: "15rem",
  },

  accountViewContainerLight: {
    backgroundColor: palette.white,
    borderRadius: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  accountViewContainerDark: {
    backgroundColor: palette.darkGrey,
    borderRadius: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  accountViewTitleLight: {
    color: palette.lapisLazuli,
    fontSize: "18rem",
    fontWeight: "bold",
  },

  accountViewTitleDark: {
    color: palette.lightGrey,
    fontSize: "18rem",
    fontWeight: "bold",
  },
})

export const LargeButton = ({
  style,
  icon,
  title,
  onPress,
  ...props
}: {
  icon?: React.ReactNode
  title: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}) => {
  const darkMode = useDarkMode()

  return (
    <ListItem
      style={styles.accountView}
      containerStyle={
        style
          ? style
          : darkMode
          ? styles.accountViewContainerDark
          : styles.accountViewContainerLight
      }
      onPress={onPress}
      {...props}
    >
      {icon && icon}
      <ListItem.Content>
        <ListItem.Title
          style={darkMode ? styles.accountViewTitleDark : styles.accountViewTitleLight}
        >
          {title}
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  )
}
