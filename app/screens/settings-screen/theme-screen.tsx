import * as React from "react"
import { useI18nContext } from "@app/i18n/i18n-react"

import { View } from "react-native"
import { makeStyles } from "@rneui/themed"

import { Screen } from "../../components/screen"

import { useApolloClient } from "@apollo/client"
import { useColorSchemeQuery } from "@app/graphql/generated"
import { updateColorScheme } from "@app/graphql/client-only-query"
import { GaloyInfo } from "@app/components/atomic/galoy-info"
import { MenuSelect, MenuSelectItem } from "@app/components/menu-select"

const useStyles = makeStyles(() => ({
  container: {
    padding: 10,
  },
  info: {
    marginTop: 20,
  },
}))

export const ThemeScreen: React.FC = () => {
  const client = useApolloClient()
  const colorSchemeData = useColorSchemeQuery()
  const colorScheme = colorSchemeData?.data?.colorScheme ?? "system"

  const { LL } = useI18nContext()
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
      <MenuSelect
        value={colorScheme}
        onChange={async (scheme) => updateColorScheme(client, scheme)}
      >
        {Themes.map(({ id, text }) => (
          <MenuSelectItem key={id} value={id}>
            {text}
          </MenuSelectItem>
        ))}
      </MenuSelect>
      <View style={styles.info}>
        <GaloyInfo>{LL.ThemeScreen.info()}</GaloyInfo>
      </View>
    </Screen>
  )
}
