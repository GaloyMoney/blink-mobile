import * as React from "react"
import { ListItem } from "@rneui/themed"
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
    color: palette.lapisLazuli,
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
  icon: React.ReactNode
  title: string
  onPress: () => void
  style?
}) => (
  <ListItem
    style={styles.accountView}
    containerStyle={style ? style : styles.accountViewContainer}
    onPress={onPress}
    {...props}
  >
    {icon && icon}
    <ListItem.Content>
      <ListItem.Title style={styles.accountViewTitle}>{title}</ListItem.Title>
    </ListItem.Content>
  </ListItem>
)
