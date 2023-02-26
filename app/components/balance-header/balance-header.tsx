import * as React from "react"
import { useEffect, useState } from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { Text, TouchableOpacity, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { palette } from "../../theme/palette"
import { TextCurrencyForAmount } from "../text-currency/text-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useBalanceHeaderQuery, useHideBalanceQuery } from "@app/graphql/generated"
import { testProps } from "../../utils/testProps"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"

const styles = EStyleSheet.create({
  balanceHeaderContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    height: 24,
  },
  balancesContainer: {
    flex: 1,
    justifyContent: "center",
  },
  footer: {
    height: 24,
  },
  headerText: {
    color: palette.midGrey,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  marginBottom: {
    marginBottom: 4,
  },
  hiddenBalanceTouchableOpacity: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
  },
  hiddenBalanceIcon: {
    fontSize: "25rem",
  },
  primaryBalanceText: {
    color: palette.darkGrey,
    fontSize: 32,
  },
})

const PrimaryLoader = () => (
  <ContentLoader
    height={40}
    width={100}
    speed={1.2}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <Rect x="0" y="0" rx="4" ry="4" width="100" height="40" />
  </ContentLoader>
)

gql`
  query balanceHeader {
    me {
      id
      defaultAccount {
        id
        btcWallet @client {
          displayBalance
        }
        usdWallet @client {
          displayBalance
        }
      }
    }
  }
`

type Props = {
  loading: boolean
}

export const BalanceHeader: React.FC<Props> = ({ loading }) => {
  const isAuthed = useIsAuthed()

  // TODO: use suspense for this component with the apollo suspense hook (in beta)
  // so there is no need to pass loading from parent?
  const { data } = useBalanceHeaderQuery({ skip: !isAuthed })
  const usdWalletDisplayBalance = isAuthed
    ? data?.me?.defaultAccount?.usdWallet?.displayBalance ?? NaN
    : 0

  const btcWalletDisplayBalance = isAuthed
    ? data?.me?.defaultAccount?.btcWallet?.displayBalance ?? NaN
    : 0

  const balanceInDisplayCurrency = usdWalletDisplayBalance + btcWalletDisplayBalance

  const { LL } = useI18nContext()
  const { data: { hideBalance } = {} } = useHideBalanceQuery()
  const [balanceHidden, setBalanceHidden] = useState(hideBalance)

  useEffect(() => {
    setBalanceHidden(hideBalance)
  }, [hideBalance])

  return (
    <View style={styles.balanceHeaderContainer}>
      <View style={styles.header}>
        <Text {...testProps("Current Balance Header")} style={styles.headerText}>
          {LL.BalanceHeader.currentBalance()}
        </Text>
      </View>
      {balanceHidden ? (
        <TouchableOpacity
          onPress={() => setBalanceHidden(!balanceHidden)}
          style={styles.hiddenBalanceTouchableOpacity}
        >
          <Icon style={styles.hiddenBalanceIcon} name="eye" />
        </TouchableOpacity>
      ) : (
        <View style={styles.balancesContainer}>
          <TouchableOpacity onPress={() => setBalanceHidden(!balanceHidden)}>
            <View style={styles.marginBottom}>
              {loading ? (
                <PrimaryLoader />
              ) : (
                <TextCurrencyForAmount
                  style={styles.primaryBalanceText}
                  currency={"display"}
                  amount={balanceInDisplayCurrency}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer} />
    </View>
  )
}
