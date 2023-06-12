import * as React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { TouchableOpacity, View } from "react-native"

import { gql } from "@apollo/client"
import { useBalanceHeaderQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { makeStyles, Text } from "@rneui/themed"

import HideableArea from "../hideable-area/hideable-area"
import {
  DisplayCurrency,
  addMoneyAmounts,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
} from "@app/types/amounts"

const Loader = () => {
  const styles = useStyles()
  return (
    <ContentLoader
      height={40}
      width={100}
      speed={1.2}
      backgroundColor={styles.loaderBackground.color}
      foregroundColor={styles.loaderForefound.color}
    >
      <Rect x="0" y="0" rx="4" ry="4" width="100" height="40" />
    </ContentLoader>
  )
}

gql`
  query balanceHeader {
    me {
      id
      defaultAccount {
        id
        btcWallet @client {
          id
          balance
        }
        usdWallet @client {
          id
          balance
        }
      }
    }
  }
`

type Props = {
  loading: boolean
  isContentVisible: boolean
  setIsContentVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const BalanceHeader: React.FC<Props> = ({
  loading,
  isContentVisible,
  setIsContentVisible,
}) => {
  const styles = useStyles()

  const isAuthed = useIsAuthed()
  const { formatMoneyAmount } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()

  // TODO: use suspense for this component with the apollo suspense hook (in beta)
  // so there is no need to pass loading from parent?
  const { data } = useBalanceHeaderQuery({ skip: !isAuthed })

  // TODO: check that there are 2 wallets.
  // otherwise fail (account with more/less 2 wallets will not be working with the current mobile app)
  // some tests accounts have only 1 wallet

  let balanceInDisplayCurrency = "$0.00"

  if (isAuthed) {
    const usdWalletBalance = toUsdMoneyAmount(
      data?.me?.defaultAccount?.usdWallet?.balance,
    )

    const btcWalletBalance = toBtcMoneyAmount(
      data?.me?.defaultAccount?.btcWallet?.balance,
    )

    const btcBalanceInDisplayCurrency =
      convertMoneyAmount && convertMoneyAmount(btcWalletBalance, DisplayCurrency)

    const usdBalanceInDisplayCurrency =
      convertMoneyAmount && convertMoneyAmount(usdWalletBalance, DisplayCurrency)

    if (usdBalanceInDisplayCurrency && btcBalanceInDisplayCurrency) {
      balanceInDisplayCurrency = formatMoneyAmount({
        moneyAmount: addMoneyAmounts({
          a: usdBalanceInDisplayCurrency,
          b: btcBalanceInDisplayCurrency,
        }),
      })
    }
  }

  const toggleIsContentVisible = () => {
    setIsContentVisible((prevState) => !prevState)
  }

  return (
    <View style={styles.balanceHeaderContainer}>
      <HideableArea
        isContentVisible={isContentVisible}
        hiddenContent={
          <TouchableOpacity
            onPress={toggleIsContentVisible}
            style={styles.hiddenBalanceTouchableOpacity}
          >
            <Text style={styles.balanceHiddenText}>****</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.balancesContainer}>
          <TouchableOpacity onPress={toggleIsContentVisible}>
            <View style={styles.marginBottom}>
              {loading ? (
                <Loader />
              ) : (
                <Text style={styles.primaryBalanceText}>{balanceInDisplayCurrency}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </HideableArea>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  balanceHeaderContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  balancesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
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
  primaryBalanceText: {
    fontSize: 32,
  },
  loaderBackground: {
    color: colors.loaderBackground,
  },
  loaderForefound: {
    color: colors.loaderForeground,
  },
  balanceHiddenText: {
    fontSize: 32,
    fontWeight: "bold",
  },
}))
