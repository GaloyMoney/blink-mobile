import * as React from "react"
import { Text, View, ActivityIndicator } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { palette } from "../../theme/palette"

import { VictoryLine, VictoryChart, VictoryAxis } from "victory-native"
import { Button } from "react-native-elements"
import { color } from "../../theme"

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
    alignSelf: "center",
    marginLeft: "32rem"
  },

  buttonStyleTime: {
    borderRadius: "40rem",
    width: "42rem",
    backgroundColor: palette.lightBlue,
  },

  buttonStyleTimeActive: {
    borderRadius: "40rem",
    width: "42rem",
    backgroundColor: color.transparent,
  },

  titleStyleTime: {
    color: palette.midGrey
  },
})


const mapping = {
  d: {
    last: 24,
    filter: 1,
    label: "Today"
  },
  
  w: {
    last: 24 * 7,
    filter: 4,
    label: "This week"
  },
  
  m: {
    last: 24 * 31,
    filter: 24,
    label: "This month"
  },
  
  y: {
    last: 0,
    filter: 24 * 2,
    label: "This year"
  },
}

export const PriceGraph = ({data}) => {
  const [time, setTime] = React.useState("d") // d, w, m, y

  let price, delta, color

  const currentData = data.slice(- mapping[time].last)

  try {
    price = currentData[currentData.length - 1].o
    delta = ( price - currentData[0].o ) / price
    color = delta > 0 ? {color: palette.green} : {color: palette.red}
  } catch (err) {
    // FIXME proper Loader
    return <ActivityIndicator animating={true} size="large" color={palette.lightBlue} />
  }



  const MULTIPLE = 100000

  return (
  <>
    <View style={styles.textView}>
      <Text style={styles.neutral}>Price for 100,000 sats: </Text>
      <Text style={styles.price}>${(price * MULTIPLE).toFixed(2)}</Text>
    </View>
    <View style={styles.textView}>
      <Text style={[styles.delta, color]}>{(delta * 100).toFixed(2)}% </Text>
      <Text style={styles.neutral}>{mapping[time].label}</Text>
    </View>
    <View style={styles.chart}>
      <VictoryChart 
      // animate={{
      //   // duration: 2000,
      //   // onLoad: { duration: 1000 }
      // }}
      >
        <VictoryAxis dependentAxis standalone={true} 
        style={{
          axis: { strokeWidth: 0},
          tickLabels: {
            fill: palette.midGrey,
            fontSize: 16
          }}} />
        <VictoryLine 
          data={currentData
            .filter((element, index) => index % mapping[time].filter == 0)
            .map(index => ({x: index.t, y: index.o * MULTIPLE}))}
          interpolation="basis" 
          style={{data: { stroke: palette.lightBlue, strokeWidth: 4 }}}
          />
      </VictoryChart>
    </View>
    <View style={{flexDirection: "row", justifyContent: "space-between", marginHorizontal: 64}}>
      <Button title="1D" buttonStyle={time == "d" ? styles.buttonStyleTime : styles.buttonStyleTimeActive} 
        titleStyle={time == "d" ? null : styles.titleStyleTime} onPress={() => setTime("d")} />
      <Button title="1W" buttonStyle={time == "w" ? styles.buttonStyleTime : styles.buttonStyleTimeActive} 
        titleStyle={time == "w" ? null : styles.titleStyleTime} onPress={() => setTime("w")} />
      <Button title="1M" buttonStyle={time == "m" ? styles.buttonStyleTime : styles.buttonStyleTimeActive} 
        titleStyle={time == "m" ? null : styles.titleStyleTime} onPress={() => setTime("m")} />
      <Button title="1Y" buttonStyle={time == "y" ? styles.buttonStyleTime : styles.buttonStyleTimeActive} 
        titleStyle={time == "y" ? null : styles.titleStyleTime} onPress={() => setTime("y")} />
    </View>
  </>
)}