import { useQuery } from "@apollo/client"
import * as React from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { VictoryAxis, VictoryChart, VictoryLine } from "victory-native"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { QUERY_PRICE } from "../../graphql/query"
import { translate } from "../../i18n"
import type { ComponentType } from "../../types/jsx"
import { prices_prices } from "../../graphql/__generated__/prices"

const styles = EStyleSheet.create({
  buttonStyleTime: {
    backgroundColor: palette.lightBlue,
    borderRadius: "40rem",
    width: "42rem",
  },

  buttonStyleTimeActive: {
    backgroundColor: color.transparent,
    borderRadius: "40rem",
    width: "42rem",
  },

  chart: {
    alignSelf: "center",
    marginLeft: "32rem",
  },

  delta: {
    fontSize: "16rem",
    fontWeight: "bold",
  },

  neutral: {
    color: palette.darkGrey,
    fontSize: "16rem",
  },

  price: {
    color: palette.lightBlue,
    fontSize: "16rem",
    fontWeight: "bold",
  },

  pricesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 64,
  },

  textView: {
    alignSelf: "center",
    flexDirection: "row",
    marginVertical: "3rem",
  },

  titleStyleTime: {
    color: palette.midGrey,
  },
})

type Props = {
  prices: prices_prices[]
}

export const PriceGraph: ComponentType = ({ prices }: Props) => {
  const mapping = React.useMemo(
    () => ({
      d: {
        last: 24,
        filter: 1,
        label: translate("PriceScreen.today"),
      },

      w: {
        last: 24 * 7,
        filter: 4,
        label: translate("PriceScreen.thisWeek"),
      },

      m: {
        last: 24 * 31,
        filter: 24,
        label: translate("PriceScreen.thisMonth"),
      },

      y: {
        last: 0,
        filter: 24 * 2,
        label: translate("PriceScreen.thisYear"),
      },
    }),
    [],
  )

  const [time, setTime] = React.useState("d") // d, w, m, y

  let price
  let delta
  let color

  const currentData = prices.slice(-mapping[time].last)

  try {
    price = currentData[currentData.length - 1].o
    delta = (price - currentData[0].o) / price
    color = delta > 0 ? { color: palette.green } : { color: palette.red }
  } catch (err) {
    // FIXME proper Loader
    return <ActivityIndicator animating size="large" color={palette.lightBlue} />
  }

  const MULTIPLE = 100000

  return (
    <>
      <View style={styles.textView}>
        <Text style={styles.neutral}>{translate("PriceScreen.satPrice")}</Text>
        <Text style={styles.price}>${(price * MULTIPLE).toFixed(2)}</Text>
      </View>
      <View style={styles.textView}>
        <Text style={[styles.delta, color]}>{(delta * 100).toFixed(2)}% </Text>
        <Text style={styles.neutral}>{mapping[time].label}</Text>
      </View>
      <View style={styles.chart}>
        <VictoryChart>
          <VictoryAxis
            dependentAxis
            standalone
            style={{
              axis: { strokeWidth: 0 },
              tickLabels: {
                fill: palette.midGrey,
                fontSize: 16,
              },
            }}
          />
          <VictoryLine
            data={currentData
              .filter((element, index) => index % mapping[time].filter == 0)
              .map((index) => ({ y: index.o * MULTIPLE }))}
            interpolation="basis"
            style={{ data: { stroke: palette.lightBlue, strokeWidth: 4 } }}
          />
        </VictoryChart>
      </View>
      <View style={styles.pricesContainer}>
        <Button
          title={translate("PriceScreen.oneDay")}
          buttonStyle={
            time == "d" ? styles.buttonStyleTime : styles.buttonStyleTimeActive
          }
          titleStyle={time == "d" ? null : styles.titleStyleTime}
          onPress={() => setTime("d")}
        />
        <Button
          title={translate("PriceScreen.oneWeek")}
          buttonStyle={
            time == "w" ? styles.buttonStyleTime : styles.buttonStyleTimeActive
          }
          titleStyle={time == "w" ? null : styles.titleStyleTime}
          onPress={() => setTime("w")}
        />
        <Button
          title={translate("PriceScreen.oneMonth")}
          buttonStyle={
            time == "m" ? styles.buttonStyleTime : styles.buttonStyleTimeActive
          }
          titleStyle={time == "m" ? null : styles.titleStyleTime}
          onPress={() => setTime("m")}
        />
        <Button
          title={translate("PriceScreen.oneYear")}
          buttonStyle={
            time == "y" ? styles.buttonStyleTime : styles.buttonStyleTimeActive
          }
          titleStyle={time == "y" ? null : styles.titleStyleTime}
          onPress={() => setTime("y")}
        />
      </View>
    </>
  )
}

export const PriceGraphDataInjected: ComponentType = () => {
  const { error, loading, data } = useQuery(QUERY_PRICE, {
    variables: { length: 365 * 24 * 10 },
    fetchPolicy: "network-only",
  })

  if (loading || data == null) {
    return <ActivityIndicator animating size="large" color={palette.lightBlue} />
  }

  if (error) {
    return <Text>{`${error}`}</Text>
  }

  return <PriceGraph prices={data.prices} />
}
