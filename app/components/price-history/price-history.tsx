import { TextStyle, ViewStyle } from "node_modules/@types/react-native/index"
import * as React from "react"
import { ActivityIndicator, StyleProp, View } from "react-native"
import { Defs, LinearGradient, Stop } from "react-native-svg"
import { VictoryArea, VictoryAxis, VictoryChart } from "victory-native"

import { gql } from "@apollo/client"
import { PricePoint, useBtcPriceListQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "@app/utils/testProps"
import { Button } from "@rneui/base"

import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { Text, makeStyles } from "@rneui/themed"

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

gql`
  query btcPriceList($range: PriceGraphRange!) {
    btcPriceList(range: $range) {
      timestamp
      price {
        base
        offset
        currencyUnit
      }
    }
  }
`

export const PriceHistory = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const [graphRange, setGraphRange] = React.useState<GraphRangeType>(GraphRange.ONE_DAY)

  const { error, loading, data } = useBtcPriceListQuery({
    fetchPolicy: "no-cache",
    variables: { range: graphRange },
  })
  const priceList = data?.btcPriceList ?? []

  if (error) {
    return <Text>{`${error}`}</Text>
  }

  if (loading || data === null || data?.btcPriceList === null) {
    return (
      <View style={styles.verticalAlignment}>
        <ActivityIndicator animating size="large" color={palette.lightBlue} />
      </View>
    )
  }

  const ranges = GraphRange[graphRange]
  const rangeTimestamps = {
    ONE_DAY: 300,
    ONE_WEEK: 1800,
    ONE_MONTH: 86400,
    ONE_YEAR: 86400,
    FIVE_YEARS: 86400,
  }

  const lastPrice = priceList && priceList[priceList.length - 1]
  if (!loading && lastPrice) {
    const timeDiff = Date.now() / 1000 - lastPrice.timestamp
    if (timeDiff > rangeTimestamps[ranges]) {
      setGraphRange(ranges)
    }
  }

  const prices = priceList
    .filter((price) => price !== null)
    .map((price) => price as PricePoint)
  // FIXME: backend should be updated so that PricePoint is non-nullable

  let priceDomain: [number, number] = [NaN, NaN]

  const currentPriceData = prices[prices.length - 1].price
  const startPriceData = prices[0].price
  const price =
    (currentPriceData.base / 10 ** currentPriceData.offset) *
    multiple(currentPriceData.currencyUnit)
  const delta = currentPriceData.base / startPriceData.base - 1
  const color = delta > 0 ? { color: palette.green } : { color: palette.red }

  // get min and max prices for domain
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

  const label = () => {
    switch (graphRange) {
      case GraphRange.ONE_DAY:
        return LL.PriceHistoryScreen.last24Hours()
      case GraphRange.ONE_WEEK:
        return LL.PriceHistoryScreen.lastWeek()
      case GraphRange.ONE_MONTH:
        return LL.PriceHistoryScreen.lastMonth()
      case GraphRange.ONE_YEAR:
        return LL.PriceHistoryScreen.lastYear()
      case GraphRange.FIVE_YEARS:
        return LL.PriceHistoryScreen.lastFiveYears()
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
    <View style={styles.verticalAlignment}>
      <View {...testProps(LL.PriceHistoryScreen.satPrice())} style={styles.textView}>
        <Text style={styles.neutral}>{LL.PriceHistoryScreen.satPrice()}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>
      <View style={styles.textView}>
        <Text style={[styles.delta, color]}>{(delta * 100).toFixed(2)}% </Text>
        <Text {...testProps("range")} style={styles.neutral}>
          {label()}
        </Text>
      </View>
      <View style={styles.chart}>
        <VictoryChart
          padding={{ top: 50, bottom: 50, left: 50, right: 25 }}
          domainPadding={{ y: 10 }}
        >
          <Defs>
            <LinearGradient id="gradient" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="20%" stopColor={palette.lightBlue} />
              <Stop offset="100%" stopColor={styles.stop.color} />
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
          {...testProps(LL.PriceHistoryScreen.oneDay())}
          title={LL.PriceHistoryScreen.oneDay()}
          buttonStyle={buttonStyleForRange(GraphRange.ONE_DAY)}
          titleStyle={titleStyleForRange(GraphRange.ONE_DAY)}
          onPress={() => setGraphRange(GraphRange.ONE_DAY)}
        />
        <Button
          {...testProps(LL.PriceHistoryScreen.oneWeek())}
          title={LL.PriceHistoryScreen.oneWeek()}
          buttonStyle={buttonStyleForRange(GraphRange.ONE_WEEK)}
          titleStyle={titleStyleForRange(GraphRange.ONE_WEEK)}
          onPress={() => setGraphRange(GraphRange.ONE_WEEK)}
        />
        <Button
          {...testProps(LL.PriceHistoryScreen.oneMonth())}
          title={LL.PriceHistoryScreen.oneMonth()}
          buttonStyle={buttonStyleForRange(GraphRange.ONE_MONTH)}
          titleStyle={titleStyleForRange(GraphRange.ONE_MONTH)}
          onPress={() => setGraphRange(GraphRange.ONE_MONTH)}
        />
        <Button
          {...testProps(LL.PriceHistoryScreen.oneYear())}
          title={LL.PriceHistoryScreen.oneYear()}
          buttonStyle={buttonStyleForRange(GraphRange.ONE_YEAR)}
          titleStyle={titleStyleForRange(GraphRange.ONE_YEAR)}
          onPress={() => setGraphRange(GraphRange.ONE_YEAR)}
        />
        <Button
          {...testProps(LL.PriceHistoryScreen.fiveYears())}
          title={LL.PriceHistoryScreen.fiveYears()}
          buttonStyle={buttonStyleForRange(GraphRange.FIVE_YEARS)}
          titleStyle={titleStyleForRange(GraphRange.FIVE_YEARS)}
          onPress={() => setGraphRange(GraphRange.FIVE_YEARS)}
        />
      </View>
    </View>
  )
}

const useStyles = makeStyles((theme) => ({
  buttonStyleTime: {
    backgroundColor: color.transparent,
    borderRadius: 40,
    width: 48,
    height: 48,
  },

  buttonStyleTimeActive: {
    backgroundColor: palette.lightBlue,
    borderRadius: 40,
    width: 48,
    height: 48,
  },

  chart: {
    alignSelf: "center",
    marginLeft: 0,
  },

  delta: {
    fontSize: 16,
    fontWeight: "bold",
  },

  neutral: {
    color: theme.colors.darkGreyOrWhite,
    fontSize: 16,
  },

  price: {
    color: palette.lightBlue,
    fontSize: 16,
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
    marginVertical: 3,
  },

  titleStyleTime: {
    color: palette.midGrey,
  },

  verticalAlignment: { flex: 1, justifyContent: "center", alignItems: "center" },

  stop: {
    color: theme.colors.white,
  },
}))
