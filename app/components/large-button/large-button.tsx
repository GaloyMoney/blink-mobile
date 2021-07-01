import * as React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { Text } from "react-native"
import { ListItem, Avatar } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "../../theme/palette"

const styles = EStyleSheet.create({
  accountAmount: {
    color: palette.darkGrey,
    fontSize: "18rem",
  },

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
    fontWeight: "bold",
    fontSize: "18rem",
  },

  transactionViewContainer: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 18,
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
