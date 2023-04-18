import * as React from "react"
import { useState } from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { Text, TouchableOpacity, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { palette } from "../../theme/palette"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  useBalanceHeaderQuery,
  useHideBalanceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { testProps } from "../../utils/testProps"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { usePriceConversion } from "@app/hooks"
import { makeStyles } from "@rneui/themed"
import HideableArea from "../hideable-area.tsx/hideable-area"

const useStyles = makeStyles((theme) => ({
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
    fontSize: 25,
    color: theme.colors.grey1,
  },
  primaryBalanceText: {
    color: theme.colors.grey1,
    fontSize: 32,
  },
  loaderBackground: {
    color: theme.colors.loaderBackground,
  },
  loaderForefound: {
    color: theme.colors.loaderForeground,
  },
}))

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
}

export const BalanceHeader: React.FC<Props> = ({ loading }) => {
  const styles = useStyles()

  const isAuthed = useIsAuthed()
  const { formatMoneyAmount } = useDisplayCurrency()
  const { convertMoneyAmount } = usePriceConversion()

  // TODO: use suspense for this component with the apollo suspense hook (in beta)
  // so there is no need to pass loading from parent?
  const { data } = useBalanceHeaderQuery({ skip: !isAuthed })
  const { data: { hideBalance } = {} } = useHideBalanceQuery()
  const hidden = hideBalance ?? false

  // TODO: check that there are 2 wallets.
  // otherwise fail (account with more/less 2 wallets will not be working with the current mobile app)
  // some tests accounts have only 1 wallet

  let balanceInDisplayCurrency = "$0.00"

  if (isAuthed) {
    const usdWalletBalance = {
      amount: data?.me?.defaultAccount?.usdWallet?.balance ?? NaN,
      currency: WalletCurrency.Usd,
    }

    const btcWalletBalance = {
      amount: data?.me?.defaultAccount?.btcWallet?.balance ?? NaN,
      currency: WalletCurrency.Btc,
    }

    const btcBalanceInDisplayCurrency =
      convertMoneyAmount && convertMoneyAmount(btcWalletBalance, "DisplayCurrency")

    const usdBalanceInDisplayCurrency =
      convertMoneyAmount && convertMoneyAmount(usdWalletBalance, "DisplayCurrency")

    if (usdBalanceInDisplayCurrency && btcBalanceInDisplayCurrency) {
      balanceInDisplayCurrency = formatMoneyAmount({
        moneyAmount: {
          amount: usdBalanceInDisplayCurrency.amount + btcBalanceInDisplayCurrency.amount,
          currency: "DisplayCurrency",
        },
      })
    }
  }

  const { LL } = useI18nContext()
  const [balanceHidden, setBalanceHidden] = useState(false)

  React.useEffect(() => {
    setBalanceHidden(hidden)
  }, [hidden])

  return (
    <View style={styles.balanceHeaderContainer}>
      <View style={styles.header}>
        <Text {...testProps("Current Balance Header")} style={styles.headerText}>
          {LL.BalanceHeader.currentBalance()}
        </Text>
      </View>
      <HideableArea
        isHidden={balanceHidden}
        hideBalance={hidden}
        hiddenContent={
          <TouchableOpacity
            onPress={() => setBalanceHidden(!balanceHidden)}
            style={styles.hiddenBalanceTouchableOpacity}
          >
            <Icon style={styles.hiddenBalanceIcon} name="eye" />
          </TouchableOpacity>
        }
      >
        <View style={styles.balancesContainer}>
          <TouchableOpacity onPress={() => setBalanceHidden(!balanceHidden)}>
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
      <View style={styles.footer} />
    </View>
  )
}
