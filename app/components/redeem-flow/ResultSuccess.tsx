import React from "react"
import { View } from "react-native"
import { makeStyles } from "@rneui/themed"
import { GaloyIcon } from "../atomic/galoy-icon"

// utils
import { testProps } from "@app/utils/testProps"

type Props = {
  success: boolean
}

const ResultSuccess: React.FC<Props> = ({ success }) => {
  const styles = useStyles()

  if (success) {
    return (
      <View style={styles.container}>
        <View {...testProps("Success Icon")} style={styles.container}>
          <GaloyIcon name={"payment-success"} size={128} />
        </View>
      </View>
    )
  } else {
    return null
  }
}

export default ResultSuccess

const useStyles = makeStyles(({ colors }) => ({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginLeft: 20,
    marginRight: 20,
  },
}))
