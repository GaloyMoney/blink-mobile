import { gql, useQuery } from "@apollo/client"
import * as React from "react"
import { ActivityIndicator, StyleProp, Text, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { VictoryAxis, VictoryChart, VictoryLine } from "victory-native"
import {
  TextStyle,
  ViewStyle,
} from "react-native-vector-icons/node_modules/@types/react-native/index"

import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { translateUnknown as translate } from "@galoymoney/client"
import type { ComponentType } from "../../types/jsx"

const BTC_PRICE_LIST = gql`
  query btcPriceList($range: PriceGraphRange!) {
    btcPriceList(range: $range) {
      timestamp
      price {
        base
        offset
        currencyUnit
        formattedAmount
      }
    }
  }
`

const multiple = (currentUnit: string) => {
  switch (currentUnit) {
    case "USDCENT":
      return 10 ** -5
    default:
      return 1
  }
}

const Graph_Range = {
  ONE_DAY: "ONE_DAY",
  ONE_WEEK: "ONE_WEEK",
  ONE_MONTH: "ONE_MONTH",
  ONE_YEAR: "ONE_YEAR",
} as const

type GraphRangeType = typeof Graph_Range[keyof typeof Graph_Range]

type Price = {
  base: number
  offset: number
  currencyUnit: string
  formattedAmount: string
}

type PricePoint = {
  timestamp: number
  price: Price
}

export const PriceGraphDataInjected: ComponentType = () => {
  const [graphRange, setGraphRange] = React.useState<GraphRangeType>(Graph_Range.ONE_DAY)

  const { error, loading, data, refetch } = useQuery(BTC_PRICE_LIST, {
    variables: { range: graphRange },
    notifyOnNetworkStatusChange: true,
  })

  if (loading || data === null) {
    return <ActivityIndicator animating size="large" color={palette.lightBlue} />
  }

  if (error) {
    return <Text>{`${error}`}</Text>
  }

  const lastPrice = data.btcPriceList[data.btcPriceList.length - 1]
  if (!loading) {
    const unixTime = Date.now() / 1000
    if (graphRange === Graph_Range.ONE_DAY) {
      if (unixTime - lastPrice.timestamp > 300) {
        refetch()
      }
    } else if (graphRange === Graph_Range.ONE_WEEK) {
      if (unixTime - lastPrice.timestamp > 1800) {
        refetch()
      }
    } else if (graphRange === Graph_Range.ONE_MONTH) {
      if (unixTime - lastPrice.timestamp > 86400) {
        refetch()
      }
    } else if (graphRange === Graph_Range.ONE_YEAR) {
      if (unixTime - lastPrice.timestamp > 86400) {
        refetch()
      }
    }
  }

  return (
    <PriceGraph
      prices={data.btcPriceList}
      graphRange={graphRange}
      setGraphRange={setGraphRange}
    />
  )
}

type Props = {
  graphRange: GraphRangeType
  prices: PricePoint[]
  setGraphRange: (graphRange: GraphRangeType) => void
}

export const PriceGraph: ComponentType = ({
  graphRange,
  prices,
  setGraphRange,
}: Props) => {
  let price
  let delta
  let color

  try {
    const currentPriceData = prices[prices.length - 1].price
    const startPriceData = prices[0].price

    price =
      (currentPriceData.base / 10 ** currentPriceData.offset) *
      multiple(currentPriceData.currencyUnit)
    delta =
      (price -
        (startPriceData.base / 10 ** startPriceData.offset) *
          multiple(startPriceData.currencyUnit)) /
      price
    color = delta > 0 ? { color: palette.green } : { color: palette.red }
  } catch (err) {
    // FIXME proper Loader
    return <ActivityIndicator animating size="large" color={palette.lightBlue} />
  }

  const label = () => {
    switch (graphRange) {
      case Graph_Range.ONE_DAY:
        return translate("PriceScreen.today")
      case Graph_Range.ONE_WEEK:
        return translate("PriceScreen.thisWeek")
      case Graph_Range.ONE_MONTH:
        return translate("PriceScreen.thisMonth")
      case Graph_Range.ONE_YEAR:
        return translate("PriceScreen.thisYear")
    }
  }

  const buttonStyleForRange = (
    buttonGraphRange: GraphRangeType,
  ): StyleProp<ViewStyle> => {
    return graphRange === buttonGraphRange
      ? styles.buttonStyleTimeActive
      : styles.buttonStyleTime
  }
  const titleStyleForRange = (titleGraphRange: GraphRangeType): StyleProp<TextStyle> => {
    return graphRange === titleGraphRange ? null : styles.titleStyleTime
  }

  return (
    <>
      <View style={styles.textView}>
        <Text style={styles.neutral}>{translate("PriceScreen.satPrice")}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>
      <View style={styles.textView}>
        <Text style={[styles.delta, color]}>{(delta * 100).toFixed(2)}% </Text>
        <Text style={styles.neutral}>{label()}</Text>
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
            data={prices.map((index) => ({
              y:
                (index.price.base / 10 ** index.price.offset) *
                multiple(index.price.currencyUnit),
            }))}
            interpolation="basis"
            style={{ data: { stroke: palette.lightBlue, strokeWidth: 4 } }}
          />
        </VictoryChart>
      </View>
      <View style={styles.pricesContainer}>
        <Button
          title={translate("PriceScreen.oneDay")}
          buttonStyle={buttonStyleForRange(Graph_Range.ONE_DAY)}
          titleStyle={titleStyleForRange(Graph_Range.ONE_DAY)}
          onPress={() => setGraphRange(Graph_Range.ONE_DAY)}
        />
        <Button
          title={translate("PriceScreen.oneWeek")}
          buttonStyle={buttonStyleForRange(Graph_Range.ONE_WEEK)}
          titleStyle={titleStyleForRange(Graph_Range.ONE_WEEK)}
          onPress={() => setGraphRange(Graph_Range.ONE_WEEK)}
        />
        <Button
          title={translate("PriceScreen.oneMonth")}
          buttonStyle={buttonStyleForRange(Graph_Range.ONE_MONTH)}
          titleStyle={titleStyleForRange(Graph_Range.ONE_MONTH)}
          onPress={() => setGraphRange(Graph_Range.ONE_MONTH)}
        />
        <Button
          title={translate("PriceScreen.oneYear")}
          buttonStyle={buttonStyleForRange(Graph_Range.ONE_YEAR)}
          titleStyle={titleStyleForRange(Graph_Range.ONE_YEAR)}
          onPress={() => setGraphRange(Graph_Range.ONE_YEAR)}
        />
      </View>
    </>
  )
}

const styles = EStyleSheet.create({
  buttonStyleTime: {
    backgroundColor: color.transparent,
    borderRadius: "40rem",
    width: "42rem",
  },

  buttonStyleTimeActive: {
    backgroundColor: palette.lightBlue,
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
