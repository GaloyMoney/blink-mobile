import * as React from "react"
import { useI18nContext } from "@app/i18n/i18n-react"

import { View } from "react-native"
import { ListItem, Text, makeStyles, useTheme } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"

import { useApolloClient } from "@apollo/client"
import { useColorSchemeQuery } from "@app/graphql/generated"
import { updateColorScheme } from "@app/graphql/client-only-query"

const useStyles = makeStyles(() => ({
  container: {
    padding: 20,
  },
  info: {
    marginBottom: 10,
  },
  viewSelectedIcon: { width: 18 },
}))

export const ThemeScreen: React.FC = () => {
  const client = useApolloClient()
  const colorSchemeData = useColorSchemeQuery()
  const colorScheme = colorSchemeData?.data?.colorScheme ?? "system"

  const { LL } = useI18nContext()
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const Themes = [
    {
      id: "system",
      text: LL.ThemeScreen.system(),
    },
    {
      id: "light",
      text: LL.ThemeScreen.light(),
    },
    {
      id: "dark",
      text: LL.ThemeScreen.dark(),
    },
  ]

  return (
    <Screen style={styles.container} preset="scroll">
      <Text style={styles.info}>{LL.ThemeScreen.info()}</Text>
      {Themes.map(({ id, text }) => (
        <ListItem key={id} bottomDivider onPress={() => updateColorScheme(client, id)}>
          <View style={styles.viewSelectedIcon}>
            {colorScheme === id && (
              <Icon name="ios-checkmark-circle" size={18} color={colors.green} />
            )}
          </View>
          <ListItem.Title>{text}</ListItem.Title>
        </ListItem>
      ))}
    </Screen>
  )
}
