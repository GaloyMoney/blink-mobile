import React from "react"
import { View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"

type Props = {
  paymentError?: string
  invalidAmountErrorMessage?: string
}

const ConfirmationError: React.FC<Props> = ({
  paymentError,
  invalidAmountErrorMessage,
}) => {
  const styles = useStyles()

  const errorMessage = paymentError || invalidAmountErrorMessage

  if (!!errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    )
  } else {
    return null
  }
}

export default ConfirmationError

const useStyles = makeStyles(({ colors }) => ({
  errorContainer: {
    marginVertical: 20,
    flex: 1,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
}))
