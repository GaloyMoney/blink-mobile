import React, { useState } from "react"
import { AmountInvalidReason, AmountStatus } from "./payment-details"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { UpgradeAccountModal } from "@app/components/upgrade-account-modal"
import { Text, makeStyles } from "@rneui/themed"
import { AccountLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useNavigation } from "@react-navigation/native"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"

export type SendBitcoinDetailsExtraInfoProps = {
  errorMessage?: string
  amountStatus: AmountStatus
  currentLevel: AccountLevel
}

export const SendBitcoinDetailsExtraInfo = ({
  errorMessage,
  amountStatus,
  currentLevel,
}: SendBitcoinDetailsExtraInfoProps) => {
  const [isUpgradeAccountModalVisible, setIsUpgradeAccountModalVisible] = useState(false)
  const closeModal = () => setIsUpgradeAccountModalVisible(false)
  const openModal = () => setIsUpgradeAccountModalVisible(true)
  const { LL } = useI18nContext()
  const { formatMoneyAmount } = useDisplayCurrency()
  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const navigateToTransactionLimits = () => {
    navigation.navigate("transactionLimitsScreen")
  }

  if (errorMessage) {
    return <GaloyErrorBox errorMessage={errorMessage} />
  }

  if (amountStatus.validAmount) {
    return null
  }

  switch (amountStatus.invalidReason) {
    case AmountInvalidReason.InsufficientLimit:
      return (
        <>
          <GaloyErrorBox
            errorMessage={LL.SendBitcoinScreen.amountExceedsLimit({
              limit: formatMoneyAmount({
                moneyAmount: amountStatus.remainingLimit,
              }),
            })}
          />
          <UpgradeAccountModal
            closeModal={closeModal}
            isVisible={isUpgradeAccountModalVisible}
          />
          {currentLevel === "ZERO" ? (
            <Text type="p2" style={styles.upgradeAccountText} onPress={openModal}>
              {LL.SendBitcoinScreen.upgradeAccountToIncreaseLimit()}
            </Text>
          ) : null}
          {currentLevel === "ONE" ? (
            <Text
              type="p2"
              style={styles.upgradeAccountText}
              onPress={navigateToTransactionLimits}
            >
              {LL.TransactionLimitsScreen.contactSupportToPerformKyc()}
            </Text>
          ) : null}
        </>
      )
    case AmountInvalidReason.InsufficientBalance:
      return (
        <GaloyErrorBox
          errorMessage={LL.SendBitcoinScreen.amountExceed({
            balance: formatMoneyAmount({ moneyAmount: amountStatus.balance }),
          })}
        />
      )
    default:
      return null
  }
}

const useStyles = makeStyles(() => {
  return {
    upgradeAccountText: {
      marginTop: 5,
      textDecorationLine: "underline",
    },
  }
})
