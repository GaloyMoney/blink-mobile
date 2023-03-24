import * as React from "react"
import { ListItem } from "@rneui/base"
import { StyleProp, ViewStyle } from "react-native"
import { makeStyles } from "@rneui/themed"

const useStyles = makeStyles((theme) => ({
  accountView: {
    marginHorizontal: 30,
    marginTop: 15,
  },

  accountViewContainer: {
    backgroundColor: theme.colors.whiteOrDarkGrey,
    borderRadius: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  accountViewTitle: {
    color: theme.colors.lapisLazuliOrLightGrey,
    fontSize: 18,
    fontWeight: "bold",
  },
}))

export const LargeButton = ({
  style,
  icon,
  title,
  onPress,
  ...props
}: {
  icon?: React.ReactNode
  title?: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}) => {
  const styles = useStyles()

  return (
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
}
