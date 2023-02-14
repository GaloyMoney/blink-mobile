import * as React from "react"
import { ListItem } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "../../theme/palette"
import { StyleProp, ViewStyle } from "react-native"

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
    color: palette.lapisLazuli,
    fontSize: "18rem",
    fontWeight: "bold",
  },
})

export const LargeButton = ({
  style,
  icon,
  title,
  ...props
}: {
  icon?: React.ReactNode
  title: string
  style?: StyleProp<ViewStyle>
}) => (
  <ListItem
    style={styles.accountView}
    containerStyle={style ? style : styles.accountViewContainer}
    {...props}
  >
    {icon && icon}
    <ListItem.Content>
      <ListItem.Title style={styles.accountViewTitle}>{title}</ListItem.Title>
    </ListItem.Content>
  </ListItem>
)
