import { gql } from "@apollo/client"
import {
  Currency,
  RealtimePriceDocument,
  useAccountUpdateDisplayCurrencyMutation,
  useCurrencyListQuery,
  useDisplayCurrencyQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { color } from "@app/theme"
import { testProps } from "@app/utils/testProps"
import { ListItem } from "@rneui/base"
import { makeStyles, SearchBar } from "@rneui/themed"
import * as React from "react"
import { useCallback } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

const useStyles = makeStyles((theme) => ({
  viewSelectedIcon: { width: 18 },

  searchBarContainer: {
    backgroundColor: theme.colors.lighterGreyOrBlack,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    marginHorizontal: 26,
    marginVertical: 8,
    paddingTop: 8,
  },

  container: { backgroundColor: theme.colors.white },

  searchBarInputContainerStyle: {
    backgroundColor: color.palette.white,
  },

  searchBarRightIconStyle: {
    padding: 8,
  },

  searchBarText: {
    color: color.palette.black,
    textDecorationLine: "none",
  },

  text: {
    color: theme.colors.darkGreyOrWhite,
  },
}))

gql`
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
  const styles = useStyles()

  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()

  const { data: dataAuthed } = useDisplayCurrencyQuery({ skip: !isAuthed })
  const displayCurrency = dataAuthed?.me?.defaultAccount?.displayCurrency

  const [updateDisplayCurrency, { loading: updatingLoading }] =
    useAccountUpdateDisplayCurrencyMutation()

  const { data, loading } = useCurrencyListQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const [newCurrency, setNewCurrency] = React.useState("")
  const [searchText, setSearchText] = React.useState("")
  const [matchingCurrencies, setMatchingCurrencies] = React.useState<Currency[]>([])

  React.useEffect(() => {
    data?.currencyList && setMatchingCurrencies(data.currencyList.slice())
  }, [data?.currencyList])

  const updateMatchingCurrency = useCallback(
    (newSearchText: string) => {
      if (!data?.currencyList) {
        return
      }
      setSearchText(newSearchText)

      const currencies = data.currencyList.slice()
      const matchSearch = getMatchingCurrencies(newSearchText, currencies)
      const currencyWithSearch = newSearchText.length > 0 ? matchSearch : currencies

      // make sure the display currency is always in the list
      if (!currencyWithSearch.find((c) => c.id === displayCurrency)) {
        const currency = currencies.find((c) => c.id === displayCurrency)
        currency && currencyWithSearch.push(currency)
      }

      // sort to make sure selection currency always on top
      currencyWithSearch.sort((a, b) => {
        if (a.id === displayCurrency) {
          return -1
        }
        if (b.id === displayCurrency) {
          return 1
        }
        return 0
      })

      setMatchingCurrencies(currencyWithSearch)
    },
    [data?.currencyList, displayCurrency],
  )

  if (loading) {
    return <ActivityIndicator />
  }

  if (!data?.currencyList) {
    return <Text>{LL.DisplayCurrencyScreen.errorLoading()}</Text>
  }

  return (
    <Screen preset="scroll">
      <SearchBar
        {...testProps(LL.common.search())}
        placeholder={LL.common.search()}
        value={searchText}
        onChangeText={updateMatchingCurrency}
        platform="default"
        round
        showLoading={false}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainerStyle}
        inputStyle={styles.searchBarText}
        rightIconContainerStyle={styles.searchBarRightIconStyle}
        searchIcon={<Icon name="search" size={24} />}
        clearIcon={<Icon name="close" size={24} onPress={() => setSearchText("")} />}
      />
      {matchingCurrencies.map((currency) => (
        <ListItem
          key={currency.id}
          bottomDivider
          containerStyle={styles.container}
          onPress={() => {
            if (displayCurrency !== currency.id) {
              setNewCurrency(currency.id)
              updateDisplayCurrency({
                variables: { input: { currency: currency.id } },
                refetchQueries: [RealtimePriceDocument],
              })
            }
          }}
        >
          <View style={styles.viewSelectedIcon}>
            {/* show loading icon */}
            {(newCurrency === currency.id && updatingLoading && <ActivityIndicator />) ||
              (displayCurrency === currency.id && !updatingLoading && (
                // show currently selected currency
                <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
              ))}
          </View>
          <ListItem.Title style={styles.text}>
            {currency.id} - {currency.name} {currency.flag && `- ${currency.flag}`}
          </ListItem.Title>
        </ListItem>
      ))}
    </Screen>
  )
}

export const wordMatchesCurrency = (searchWord: string, currency: Currency): boolean => {
  const matchForName = currency.name.toLowerCase().includes(searchWord.toLowerCase())
  const matchForId = currency.id.toLowerCase().includes(searchWord.toLowerCase())

  return matchForName || matchForId
}

export const getMatchingCurrencies = (searchText: string, currencies: Currency[]) => {
  const searchWordArray = searchText.split(" ").filter((text) => text.trim().length > 0)

  return currencies.filter((currency) =>
    searchWordArray.some((word) => wordMatchesCurrency(word, currency)),
  )
}
