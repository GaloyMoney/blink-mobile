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
    borderRadius: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  accountViewTitle: {
    // fontFamily: "DMSans",
    color: palette.lapisLazuli,
    fontSize: "18rem",
    fontWeight: "bold",
  },

  transactionViewContainer: {
    borderTopRightRadius: "10rem",
    borderTopLeftRadius: "10rem",
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
    {
      icon && icon
      // <Avatar avatarStyle={{ borderColor: "black", borderWidth: 1 }}>{icon}</Avatar>
    }
    <ListItem.Content>
      <ListItem.Title style={styles.accountViewTitle}>{title}</ListItem.Title>
    </ListItem.Content>
  </ListItem>
)
