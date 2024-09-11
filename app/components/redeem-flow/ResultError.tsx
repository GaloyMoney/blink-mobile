import React from "react"
import { View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"

type Props = {
  err: string
}

const ResultError: React.FC<Props> = ({ err }) => {
  const styles = useStyles()
  if (!!err) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText} selectable>
          {err}
        </Text>
      </View>
    )
  } else {
    return null
  }
}

export default ResultError

const useStyles = makeStyles(({ colors }) => ({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginLeft: 20,
    marginRight: 20,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
}))
