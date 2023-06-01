import * as React from "react"
import { useI18nContext } from "@app/i18n/i18n-react"

import { View } from "react-native"
import { makeStyles, useTheme } from "@rneui/themed"

import { Screen } from "../../components/screen"

import { useApolloClient } from "@apollo/client"
import { useColorSchemeQuery } from "@app/graphql/generated"
import { updateColorScheme } from "@app/graphql/client-only-query"
import { GaloyInfo } from "@app/components/atomic/galoy-info"
import { Select, SelectItem } from "@app/components/select"

const useStyles = makeStyles(() => ({
  container: {
    padding: 10,
  },
  info: {
    marginTop: 20,
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
      <Select
        value={colorScheme}
        onChange={(scheme) => updateColorScheme(client, scheme)}
      >
        {Themes.map(({ id, text }) => (
          <SelectItem value={id}>{text}</SelectItem>
        ))}
      </Select>
      <View style={styles.info}>
        <GaloyInfo>{LL.ThemeScreen.info()}</GaloyInfo>
      </View>
    </Screen>
  )
}
