import * as React from "react"
import { ListItem, Avatar } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "../../theme/palette"

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

interface ILargeButton {
  icon: React.Component
  title: string
  onPress: (item: any) => void
  loading?: boolean
  style?
}

export const LargeButton = ({
  style,
  icon,
  title,
  onPress,
  loading,
  ...props
}: ILargeButton) => (
  <ListItem
    style={styles.accountView}
    containerStyle={style ? styles[style] : styles.accountViewContainer}
    titleStyle={styles.accountViewTitle}
    chevron
    title={title}
    onPress={onPress}
    underlayColor={palette.lighterGrey}
    activeOpacity={0.7}
    leftAvatar={icon}
    {...props}
  >
    <Avatar>{icon}</Avatar>
    <ListItem.Content>
      <ListItem.Title style={styles.accountViewTitle}>{title}</ListItem.Title>
    </ListItem.Content>
  </ListItem>
)
