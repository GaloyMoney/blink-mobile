import * as React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { Text } from "react-native"
import { ListItem, Avatar } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "../../theme/palette"

const styles = EStyleSheet.create({
  accountAmount: {
    fontSize: "18rem",
    color: palette.darkGrey
  },
  
  accountView: {
    marginTop: "15rem",
    marginHorizontal: "30rem",
  },

  accountViewContainer: {
    backgroundColor: palette.white,
    borderRadius: 8,
  },

  transactionViewContainer: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 18,
  },

  accountViewTitle: {
    // fontFamily: "DMSans",
    color: palette.darkGrey,
    fontWeight: "bold",
    fontSize: "18rem",
  },
})

interface ILargeButton {
  icon: React.Component,
  title: string,
  onPress: (item: any) => void,
  loading?: boolean,
  style?
}

export const LargeButton = ({ style, icon, title, onPress, loading, ...props}: ILargeButton) => {

  return (
    <ListItem
      style={styles.accountView}
      containerStyle={style ? styles[style]: styles.accountViewContainer}
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
        <ListItem.Title>{title}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  )
}