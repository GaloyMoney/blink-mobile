import React, { useState } from "react"
import { AmountInvalidReason, AmountStatus } from "./payment-details"
import { GaloyWarning } from "@app/components/atomic/galoy-warning"
import { UpgradeAccountModal } from "@app/components/upgrade-account-modal"
import { Text } from "@rneui/themed"
import { AccountLevel } from "@app/graphql/level-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { makeStyles } from "@rneui/base"

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

  if (errorMessage) {
    return <GaloyWarning errorMessage={errorMessage} highlight />
  }

  if (amountStatus.validAmount) {
    return null
  }

  switch (amountStatus.invalidReason) {
    case AmountInvalidReason.InsufficientLimit:
      return (
        <>
          <GaloyWarning
            errorMessage={LL.SendBitcoinScreen.amountExceedsLimit({
              limit: formatMoneyAmount({
                moneyAmount: amountStatus.remainingLimit,
              }),
            })}
            highlight
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
        </>
      )
    case AmountInvalidReason.InsufficientBalance:
      return (
        <GaloyWarning
          errorMessage={LL.SendBitcoinScreen.amountExceed({
            balance: formatMoneyAmount({ moneyAmount: amountStatus.balance }),
          })}
          highlight
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
