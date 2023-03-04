/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react"
import { Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"

import { palette } from "../../theme/palette"

import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

type Props = {
  errs: { message: string }[]
  status: string
}

export const PaymentStatusIndicator: React.FC<Props> = ({ errs, status }) => {
  const { LL } = useI18nContext()
  if (status === "success") {
    return (
      <>
        <GaloyIcon name={"payment-success"} size={128} />
        <Text style={styles.successText}>{LL.SendBitcoinScreen.success()}</Text>
      </>
    )
  }

  if (status === "error") {
    return (
      <>
        <GaloyIcon name={"payment-error"} size={128} />
        {errs.map(({ message }, item) => (
          <Text key={`error-${item}`} style={styles.errorText}>
            {message}
          </Text>
        ))}
      </>
    )
  }

  if (status === "pending") {
    return (
      <>
        <GaloyIcon name={"payment-pending"} size={128} />
        <Text style={styles.pendingText}>{LL.SendBitcoinScreen.notConfirmed()}</Text>
      </>
    )
  }

  return <></>
}

const styles = EStyleSheet.create({
  errorText: {
    color: palette.red,
    fontSize: 18,
    textAlign: "center",
  },
  pendingText: {
    fontSize: 18,
    textAlign: "center",
  },

  successText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "center",
  },
})
