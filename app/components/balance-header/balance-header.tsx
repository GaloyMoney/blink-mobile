import * as React from "react"
import styled from "styled-components/native"
import ContentLoader, { Rect } from "react-content-loader/native"
import { makeStyles, Text } from "@rneui/themed"

// gql
import { useBalanceHeaderQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getUsdWallet } from "@app/graphql/wallets-utils"

// hooks
import { usePriceConversion } from "@app/hooks"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"

// utils
import {
  DisplayCurrency,
  addMoneyAmounts,
  toBtcMoneyAmount,
  toUsdMoneyAmount,
} from "@app/types/amounts"

type Props = {
  loading?: boolean
  isContentVisible: boolean
  setIsContentVisible: React.Dispatch<React.SetStateAction<boolean>>
  breezBalance: number | null
  walletType?: "btc" | "usd"
  smallText?: boolean
}

export const BalanceHeader: React.FC<Props> = ({
  loading,
  isContentVisible,
  setIsContentVisible,
  breezBalance,
  walletType,
  smallText,
}) => {
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
    const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

    const usdWalletBalance = toUsdMoneyAmount(usdWallet?.balance)
    const btcWalletBalance = toBtcMoneyAmount(breezBalance ?? NaN)

    const btcBalanceInDisplayCurrency =
      convertMoneyAmount && convertMoneyAmount(btcWalletBalance, DisplayCurrency)

    const usdBalanceInDisplayCurrency =
      convertMoneyAmount && convertMoneyAmount(usdWalletBalance, DisplayCurrency)

    if (usdBalanceInDisplayCurrency && btcBalanceInDisplayCurrency) {
      balanceInDisplayCurrency = formatMoneyAmount({
        moneyAmount: addMoneyAmounts({
          a: walletType === "btc" ? toUsdMoneyAmount(0) : usdBalanceInDisplayCurrency,
          b: walletType === "usd" ? toBtcMoneyAmount(0) : btcBalanceInDisplayCurrency,
        }),
      })
    }
  }

  if (!isContentVisible) {
    return (
      <Wrapper
        smallText={smallText}
        onPress={() => setIsContentVisible(!isContentVisible)}
        activeOpacity={0.5}
      >
        {loading ? (
          <Loader />
        ) : (
          <StyledText smallText={smallText}>{balanceInDisplayCurrency}</StyledText>
        )}
      </Wrapper>
    )
  } else {
    return (
      <Wrapper
        smallText={smallText}
        onPress={() => setIsContentVisible(!isContentVisible)}
        activeOpacity={0.5}
      >
        <StyledText smallText={smallText}>****</StyledText>
      </Wrapper>
    )
  }
}

const Wrapper = styled.TouchableOpacity<{ smallText?: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ smallText }) => (smallText ? 0 : "4px")};
`

const StyledText = styled(Text)<{ smallText?: boolean }>`
  font-size: ${({ smallText }) => (smallText ? "22px" : "32px")};
`

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

const useStyles = makeStyles(({ colors }) => ({
  loaderBackground: {
    color: colors.loaderBackground,
  },
  loaderForefound: {
    color: colors.loaderForeground,
  },
}))
