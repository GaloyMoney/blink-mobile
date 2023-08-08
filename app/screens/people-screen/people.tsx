import { StackNavigationProp } from "@react-navigation/stack"
import { SearchBar } from "@rneui/base"
import { ListItem, makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "../../components/screen"
import { PeopleStackParamList } from "../../navigation/stack-param-lists"
import { testProps } from "../../utils/testProps"
import { toastShow } from "../../utils/toast"

import { useContactsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { CirclesCard } from "./circles-card"
import { ContactsCard } from "./contacts-card"

export const PeopleScreen: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const navigation =
    useNavigation<StackNavigationProp<PeopleStackParamList, "peopleHome">>()

  const { LL } = useI18nContext()

  return (
    <Screen style={styles.screen} preset="scroll">
      <CirclesCard />
      <ContactsCard />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  screen: {
    padding: 24,
  },
}))
