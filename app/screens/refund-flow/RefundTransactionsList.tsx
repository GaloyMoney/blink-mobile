import React, { useCallback, useState } from "react"
import { ActivityIndicator, FlatList, Linking } from "react-native"
import styled from "styled-components/native"
import { Text, useTheme } from "@rneui/themed"
import { StackScreenProps } from "@react-navigation/stack"
import { listRefundables, RefundableSwap } from "@breeztech/react-native-breez-sdk-liquid"
import { Colors } from "@rneui/base"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useFocusEffect } from "@react-navigation/native"
import { useAppConfig, useDisplayCurrency, usePriceConversion } from "@app/hooks"

// utils
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { DisplayCurrency, toBtcMoneyAmount } from "@app/types/amounts"
import { loadJson } from "@app/utils/storage"
import { mergeByTimestamp } from "@app/utils/utility"
import { outputRelativeDate } from "@app/components/transaction-date"

type Props = StackScreenProps<RootStackParamList, "RefundTransactionList">

type RenderItemProps = {
  item: { amountSat: number; swapAddress: string; timestamp: number; txId?: string }
  index: number
}

const RefundTransactionsList: React.FC<Props> = ({ navigation }) => {
  const { LL, locale } = useI18nContext()
  const { colors } = useTheme().theme
  const { galoyInstance } = useAppConfig().appConfig
  const { convertMoneyAmount } = usePriceConversion()
  const { formatDisplayAndWalletAmount } = useDisplayCurrency()

  const [loading, setLoading] = useState<boolean>(false)
  const [refundables, setRefundables] = useState<RefundableSwap[]>()

  if (!convertMoneyAmount) return null

  useFocusEffect(
    useCallback(() => {
      fetchRefundables()
    }, []),
  )

  const fetchRefundables = async () => {
    setLoading(true)
    const refundables = (await listRefundables()) || []
    const refundedTxs = (await loadJson("refundedTxs")) || []
    const merged = mergeByTimestamp(refundables, refundedTxs)
    setRefundables(merged)
    setLoading(false)
  }

  const renderItem = ({ item }: RenderItemProps) => {
    const pressHandler = () => {
      if (!!item.txId) {
        Linking.openURL(galoyInstance.blockExplorer + item.txId)
      } else {
        navigation.navigate("RefundDestination", {
          swapAddress: item.swapAddress,
          amount: item.amountSat,
        })
      }
    }

    const formattedAmount = formatDisplayAndWalletAmount({
      displayAmount: convertMoneyAmount(
        toBtcMoneyAmount(item.amountSat),
        DisplayCurrency,
      ),
      walletAmount: toBtcMoneyAmount(item.amountSat),
    })

    return (
      <Item colors={colors}>
        <ColumnWrapper>
          <Amount>{formattedAmount}</Amount>
          <Time color={colors.grey1}>{outputRelativeDate(item.timestamp, locale)}</Time>
        </ColumnWrapper>
        <BtnWrapper onPress={pressHandler} isRefunded={!!item?.txId}>
          <BtnText color={colors.white}>
            {!!item?.txId ? LL.RefundFlow.view() : LL.RefundFlow.refund()}
          </BtnText>
        </BtnWrapper>
      </Item>
    )
  }

  const renderListEmptyComp = () => {
    return (
      <EmptyWrapper>
        <EmptyText>{LL.RefundFlow.noRefundables()}</EmptyText>
      </EmptyWrapper>
    )
  }
  if (loading) {
    return (
      <LoadingWrapper>
        <ActivityIndicator color={"#60aa55"} size={"large"} />
      </LoadingWrapper>
    )
  } else {
    return (
      <FlatList
        data={refundables}
        renderItem={renderItem}
        ListEmptyComponent={renderListEmptyComp()}
        contentContainerStyle={{ flex: 1 }}
      />
    )
  }
}
export default RefundTransactionsList

const LoadingWrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`

const Item = styled.View<{ colors: Colors }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ colors }) => colors.grey4};
  padding-horizontal: 20px;
  padding-vertical: 10px;
`
const ColumnWrapper = styled.View``

const Amount = styled(Text)`
  font-size: 15px;
  margin-bottom: 5px;
`
const Time = styled(Text)`
  font-size: 15px;
`
const BtnWrapper = styled.TouchableOpacity<{ isRefunded?: boolean }>`
  background-color: ${({ isRefunded }) => (isRefunded ? "#fe990d" : "#60aa55")};
  border-radius: 10px;
  padding-vertical: 5px;
  padding-horizontal: 15px;
`

const BtnText = styled(Text)`
  font-size: 16px;
`

const EmptyWrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`

const EmptyText = styled(Text)`
  font-size: 20px;
`
