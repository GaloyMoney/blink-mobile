import * as React from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "../../theme/palette"

import { VictoryLine, VictoryChart } from "victory-native"

const styles = EStyleSheet.create({
  neutral: {
    color: palette.darkGrey,
    fontSize: "16rem",
  },

  textView: {
    flexDirection: "row",
    alignSelf: "center",
    marginVertical: "3rem",
  },

  price: {
    fontSize: "16rem",
    fontWeight: "bold",
    color: palette.blue
  },

  delta: {
    fontSize: "16rem",
    fontWeight: "bold",
  },

  chart: {
    alignSelf: "center"
  }
})


export const Price = ({price, delta, data}) => {
  const color = delta > 0 ? {color: palette.green} : {color: palette.red}

  return (
  <>
    <View style={styles.textView}>
      <Text style={styles.neutral}>Bitcoin Price </Text>
      <Text style={styles.price}>{price}</Text>
    </View>
    <View style={styles.textView}>
      <Text style={[styles.delta, color]}>{delta}% </Text>
      <Text style={styles.neutral}>Today</Text>
    </View>
    <View style={styles.chart}>
      <VictoryChart width={350} >
        <VictoryLine data={data} interpolation="natural" style={{data: { stroke: palette.blue }}} />
      </VictoryChart>
    </View>
  </>
)}