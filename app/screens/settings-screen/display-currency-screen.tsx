import { gql } from "@apollo/client"
import {
  useAccountUpdateDisplayCurrencyMutation,
  useCurrencyListQuery,
  useDisplayCurrencyQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { color } from "@app/theme"
import { testProps } from "@app/utils/testProps"
import { ListItem, SearchBar } from "@rneui/base"
import * as React from "react"
import { ActivityIndicator, Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"

const styles = EStyleSheet.create({
  viewSelectedIcon: { width: 18 },

  searchBarContainer: {
    backgroundColor: color.palette.lighterGrey,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    marginHorizontal: 26,
    marginVertical: 8,
    paddingTop: 8,
  },

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
})

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
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()

  const { data: dataAuthed } = useDisplayCurrencyQuery({ skip: !isAuthed })
  const displayCurrency = dataAuthed?.me?.defaultAccount?.displayCurrency || "USD"

  const [updateDisplayCurrency, { loading: updatingLoading }] =
    useAccountUpdateDisplayCurrencyMutation()

  const { data, loading } = useCurrencyListQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const [newCurrency, setNewCurrency] = React.useState("")
  const [searchText, setSearchText] = React.useState("")

  if (loading) {
    return <ActivityIndicator />
  }

  if (!data?.currencyList) {
    return <Text>{LL.DisplayCurrencyScreen.errorLoading()}</Text>
  }

  const currencies = data.currencyList

  return (
    <Screen preset="scroll">
      <SearchBar
        {...testProps(LL.common.search())}
        placeholder={LL.common.search()}
        value={searchText}
        // onChangeText={updateMatchingContacts}
        platform="default"
        round
        lightTheme
        showLoading={false}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainerStyle}
        inputStyle={styles.searchBarText}
        rightIconContainerStyle={styles.searchBarRightIconStyle}
        searchIcon={<Icon name="search" size={24} />}
        clearIcon={<Icon name="close" size={24} onPress={() => setSearchText("")} />}
      />
      {currencies.map((currency) => (
        <ListItem
          key={currency.id}
          bottomDivider
          onPress={() => {
            if (displayCurrency !== currency.id) {
              setNewCurrency(currency.id)
              updateDisplayCurrency({
                variables: { input: { currency: currency.id } },
              })
            }
          }}
        >
          <View style={styles.viewSelectedIcon}>
            {(newCurrency === currency.id && updatingLoading && <ActivityIndicator />) ||
              (displayCurrency === currency.id && !updatingLoading && (
                <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
              )) || <Icon name="ios-checkmark-circle" size={18} color={palette.white} />}
          </View>
          <ListItem.Title>
            {currency.id} - {currency.name} {currency.flag && `- ${currency.flag}`}
          </ListItem.Title>
        </ListItem>
      ))}
    </Screen>
  )
}
