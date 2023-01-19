import * as React from "react"
import { ActivityIndicator, StyleProp, Text, View } from "react-native"
import { Button } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { VictoryAxis, VictoryChart, VictoryArea } from "victory-native"
import { TextStyle, ViewStyle } from "node_modules/@types/react-native/index"

import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { Defs, LinearGradient, Stop } from "react-native-svg"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useBtcPriceListQuery } from "@app/graphql/generated"
import { gql } from "@apollo/client"

const multiple = (currentUnit: string) => {
  switch (currentUnit) {
    case "USDCENT":
      return 10 ** -5
    default:
      return 1
  }
}

const GraphRange = {
  ONE_DAY: "ONE_DAY",
  ONE_WEEK: "ONE_WEEK",
  ONE_MONTH: "ONE_MONTH",
  ONE_YEAR: "ONE_YEAR",
  FIVE_YEARS: "FIVE_YEARS",
} as const

type GraphRangeType = (typeof GraphRange)[keyof typeof GraphRange]

export type Price = {
  base: number
  offset: number
  currencyUnit: string
  formattedAmount: string
}

type PricePoint = {
  timestamp: number
  price: Price
}

gql`
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

export const PriceGraphDataInjected = () => {
  const [graphRange, setGraphRange] = React.useState<GraphRangeType>(GraphRange.ONE_DAY)

  const { error, loading, data, refetch } = useBtcPriceListQuery({
    variables: { range: graphRange },
    notifyOnNetworkStatusChange: true,
  })

  if (loading || data === null || !data?.btcPriceList) {
    return <ActivityIndicator animating size="large" color={palette.lightBlue} />
  }

  if (error) {
    return <Text>{`${error}`}</Text>
  }

  const lastPrice = data.btcPriceList[data.btcPriceList.length - 1]
  if (!loading && lastPrice) {
    const unixTime = Date.now() / 1000
    if (graphRange === GraphRange.ONE_DAY) {
      if (unixTime - lastPrice.timestamp > 300) {
        refetch()
      }
    } else if (graphRange === GraphRange.ONE_WEEK) {
      if (unixTime - lastPrice.timestamp > 1800) {
        refetch()
      }
    } else if (graphRange === GraphRange.ONE_MONTH) {
      if (unixTime - lastPrice.timestamp > 86400) {
        refetch()
      }
    } else if (graphRange === GraphRange.ONE_YEAR) {
      if (unixTime - lastPrice.timestamp > 86400) {
        refetch()
      }
    } else if (graphRange === GraphRange.FIVE_YEARS) {
      if (unixTime - lastPrice.timestamp > 86400) {
        refetch()
      }
    }
  }

  return (
    <PriceGraph
      prices={data.btcPriceList
        .filter((price) => price !== null)
        .map((price) => price as PricePoint)} // FIXME: backend should be updated so that PricePoint is non-nullable
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

export const PriceGraph = ({ graphRange, prices, setGraphRange }: Props) => {
  const { LL } = useI18nContext()
  let price
  let delta
  let color
  let priceDomain

  try {
    const currentPriceData = prices[prices.length - 1].price
    const startPriceData = prices[0].price

    price =
      (currentPriceData.base / 10 ** currentPriceData.offset) *
      multiple(currentPriceData.currencyUnit)
    delta = currentPriceData.base / startPriceData.base - 1
    color = delta > 0 ? { color: palette.green } : { color: palette.red }

    // get min and max prices for domain
    priceDomain = [null, null]
    prices.forEach((p) => {
      if (!priceDomain[0] || p.price.base < priceDomain[0]) priceDomain[0] = p.price.base
      if (!priceDomain[1] || p.price.base > priceDomain[1]) priceDomain[1] = p.price.base
    })
    priceDomain = [
      (priceDomain[0] / 10 ** startPriceData.offset) *
        multiple(startPriceData.currencyUnit),
      (priceDomain[1] / 10 ** startPriceData.offset) *
        multiple(startPriceData.currencyUnit),
    ]
  } catch (err) {
    // FIXME proper Loader
    return <ActivityIndicator animating size="large" color={palette.lightBlue} />
  }

  const label = () => {
    switch (graphRange) {
      case GraphRange.ONE_DAY:
        return LL.PriceScreen.today()
      case GraphRange.ONE_WEEK:
        return LL.PriceScreen.thisWeek()
      case GraphRange.ONE_MONTH:
        return LL.PriceScreen.thisMonth()
      case GraphRange.ONE_YEAR:
        return LL.PriceScreen.thisYear()
      case GraphRange.FIVE_YEARS:
        return LL.PriceScreen.lastFiveYears()
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
        <Text style={styles.neutral}>{LL.PriceScreen.satPrice()}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>
      <View style={styles.textView}>
        <Text style={[styles.delta, color]}>{(delta * 100).toFixed(2)}% </Text>
        <Text style={styles.neutral}>{label()}</Text>
      </View>
      <View style={styles.chart}>
        <VictoryChart
          padding={{ top: 50, bottom: 50, left: 50, right: 25 }}
          domainPadding={{ y: 10 }}
        >
          <Defs>
            <LinearGradient id="gradient" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0%" stopColor={palette.lightBlue} />
              <Stop offset="100%" stopColor={palette.white} />
            </LinearGradient>
          </Defs>
          <VictoryAxis
            dependentAxis
            standalone
            style={{
              axis: { strokeWidth: 0 },
              grid: {
                stroke: palette.black,
                strokeOpacity: 0.1,
                strokeWidth: 1,
                strokeDasharray: "6, 6",
              },
              tickLabels: {
                fill: palette.midGrey,
                fontSize: 16,
              },
            }}
          />
          <VictoryArea
            animate={{
              duration: 500,
              easing: "expInOut",
            }}
            data={prices.map((index) => ({
              y:
                (index.price.base / 10 ** index.price.offset) *
                multiple(index.price.currencyUnit),
            }))}
            domain={{ y: priceDomain }}
            interpolation="monotoneX"
            style={{
              data: {
                stroke: palette.lightBlue,
                strokeWidth: 3,
                fillOpacity: 0.3,
                fill: "url(#gradient)",
              },
            }}
          />
        </VictoryChart>
      </View>
      <View style={styles.pricesContainer}>
        <Button
          title={LL.PriceScreen.oneDay()}
          buttonStyle={buttonStyleForRange(GraphRange.ONE_DAY)}
          titleStyle={titleStyleForRange(GraphRange.ONE_DAY)}
          onPress={() => setGraphRange(GraphRange.ONE_DAY)}
        />
        <Button
          title={LL.PriceScreen.oneWeek()}
          buttonStyle={buttonStyleForRange(GraphRange.ONE_WEEK)}
          titleStyle={titleStyleForRange(GraphRange.ONE_WEEK)}
          onPress={() => setGraphRange(GraphRange.ONE_WEEK)}
        />
        <Button
          title={LL.PriceScreen.oneMonth()}
          buttonStyle={buttonStyleForRange(GraphRange.ONE_MONTH)}
          titleStyle={titleStyleForRange(GraphRange.ONE_MONTH)}
          onPress={() => setGraphRange(GraphRange.ONE_MONTH)}
        />
        <Button
          title={LL.PriceScreen.oneYear()}
          buttonStyle={buttonStyleForRange(GraphRange.ONE_YEAR)}
          titleStyle={titleStyleForRange(GraphRange.ONE_YEAR)}
          onPress={() => setGraphRange(GraphRange.ONE_YEAR)}
        />
        <Button
          title={LL.PriceScreen.fiveYears()}
          buttonStyle={buttonStyleForRange(GraphRange.FIVE_YEARS)}
          titleStyle={titleStyleForRange(GraphRange.FIVE_YEARS)}
          onPress={() => setGraphRange(GraphRange.FIVE_YEARS)}
        />
      </View>
    </>
  )
}

const styles = EStyleSheet.create({
  buttonStyleTime: {
    backgroundColor: color.transparent,
    borderRadius: "40rem",
    width: "48rem",
    height: "48rem",
  },

  buttonStyleTimeActive: {
    backgroundColor: palette.lightBlue,
    borderRadius: "40rem",
    width: "48rem",
    height: "48rem",
  },

  chart: {
    alignSelf: "center",
    marginLeft: "0rem",
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
    marginHorizontal: 32,
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
