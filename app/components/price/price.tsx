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
    color: palette.lightBlue,
  },

  delta: {
    fontSize: "16rem",
    fontWeight: "bold",
  },

  chart: {
    alignSelf: "center"
  }
})


export const Price = ({data}) => {
  const price = data[24].o
  const delta = ( price - data[0].o ) / price
  const color = delta > 0 ? {color: palette.green} : {color: palette.red}

  return (
  <>
    <View style={styles.textView}>
      <Text style={styles.neutral}>Sats Price </Text>
      <Text style={styles.price}>${price}</Text>
    </View>
    <View style={styles.textView}>
      <Text style={[styles.delta, color]}>{(delta * 100).toFixed(2)}% </Text>
      <Text style={styles.neutral}>Today</Text>
    </View>
    <View style={styles.chart}>
      {/* <VictoryChart width={350} > */}
        <VictoryLine 
          data={data.map(index => index.o)}
          interpolation="basis" 
          style={{data: { stroke: palette.lightBlue, strokeWidth: 4 }}} />
      {/* </VictoryChart> */}
    </View>
  </>
)}