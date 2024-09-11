import React from "react"
import { makeStyles, Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"

// utils
import { testProps } from "@app/utils/testProps"

type Props = {
  defaultDescription: string
  domain: string
}

const DetailDescription: React.FC<Props> = ({ defaultDescription, domain }) => {
  const { LL } = useI18nContext()
  const styles = useStyles()

  return (
    <>
      {defaultDescription && (
        <Text {...testProps("description")} style={styles.text}>
          {defaultDescription}
        </Text>
      )}
      <Text style={styles.text}>
        {LL.RedeemBitcoinScreen.amountToRedeemFrom({ domain })}
      </Text>
    </>
  )
}

export default DetailDescription

const useStyles = makeStyles(({ colors }) => ({
  text: {
    fontSize: 16,
    textAlign: "center",
  },
}))
