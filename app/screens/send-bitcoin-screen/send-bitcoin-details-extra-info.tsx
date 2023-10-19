import React, { useState } from "react"
import { AmountInvalidReason, AmountStatus } from "./payment-details"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { UpgradeAccountModal } from "@app/components/upgrade-account-modal"
import { Text, makeStyles } from "@rneui/themed"
import { AccountLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"

import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

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
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const [isUpgradeAccountModalVisible, setIsUpgradeAccountModalVisible] = useState(false)
  const closeModal = () => setIsUpgradeAccountModalVisible(false)
  const openModal = () => setIsUpgradeAccountModalVisible(true)
  const { LL } = useI18nContext()
  const { formatMoneyAmount } = useDisplayCurrency()
  const styles = useStyles()

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
            <GaloyPrimaryButton
              title={LL.TransactionLimitsScreen.increaseLimits()}
              onPress={() => navigation.navigate("fullOnboardingFlow")}
            />
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
