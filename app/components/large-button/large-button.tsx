import * as React from "react"
import { ListItem, Avatar } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "../../theme/palette"
import { ComponentType } from "../../types/jsx"

const styles = EStyleSheet.create({
  accountView: {
    marginHorizontal: "30rem",
    marginTop: "15rem",
  },

  accountViewContainer: {
    backgroundColor: palette.white,
    borderRadius: 8,
  },

  accountViewTitle: {
    // fontFamily: "DMSans",
    color: palette.darkGrey,
    fontSize: "18rem",
    fontWeight: "bold",
  },
})

export const LargeButton: ComponentType = ({
  style,
  icon,
  title,
  onPress,
  ...props
}: {
  icon: React.Component
  title: string
  onPress: () => void
  style?
}) => (
  <ListItem
    style={styles.accountView}
    containerStyle={style ? styles[style] : styles.accountViewContainer}
    onPress={onPress}
    underlayColor={palette.lighterGrey}
    activeOpacity={0.7}
    {...props}
  >
    <Avatar>{icon}</Avatar>
    <ListItem.Content>
      <ListItem.Title style={styles.accountViewTitle}>{title}</ListItem.Title>
    </ListItem.Content>
  </ListItem>
)
