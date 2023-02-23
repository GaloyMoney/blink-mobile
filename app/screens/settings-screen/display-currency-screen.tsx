import { gql } from "@apollo/client"
import {
  useAccountUpdateDisplayCurrencyMutation,
  useCurrencyListQuery,
  useDisplayCurrencyQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { ListItem } from "@rneui/base"
import * as React from "react"
import { ActivityIndicator, Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { Screen } from "../../components/screen"
import Icon from "react-native-vector-icons/Ionicons"
import { palette } from "../../theme/palette"
import { useI18nContext } from "@app/i18n/i18n-react"

const styles = EStyleSheet.create({
  screenStyle: {},
})

gql`
  query currencyList {
    currencyList {
      code
      flag
      name
      symbol
    }
  }

  mutation accountUpdateDisplayCurrency($input: AccountUpdateDisplayCurrencyInput!) {
    accountUpdateDisplayCurrency(input: $input) {
      errors {
        message
      }
      account {
        id
        displayCurrency
      }
    }
  }
`

export const DisplayCurrencyScreen: React.FC = () => {
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()

  const { data: dataAuthed } = useDisplayCurrencyQuery({ skip: !isAuthed })
  const displayCurrency = dataAuthed?.me?.defaultAccount?.displayCurrency || "USD"

  const [updateDisplayCurrency] = useAccountUpdateDisplayCurrencyMutation()

  const { data, loading } = useCurrencyListQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  if (loading) {
    return <ActivityIndicator />
  }

  if (!data?.currencyList) {
    return <Text>{LL.DisplayCurrencyScreen.errorLoading()}</Text>
  }

  const currencies = data.currencyList

  return (
    <Screen preset="scroll" style={styles.screenStyle}>
      {currencies.map((currency) => (
        <ListItem
          key={currency.code}
          bottomDivider
          onPress={() => {
            if (displayCurrency !== currency.code) {
              updateDisplayCurrency({
                variables: { input: { currency: currency.code } },
              })
            }
          }}
        >
          <ListItem.Title>
            {currency.code} {currency.symbol} {currency.flag} {currency.name}
          </ListItem.Title>
          {displayCurrency === currency.code && (
            <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
          )}
        </ListItem>
      ))}
    </Screen>
  )
}
