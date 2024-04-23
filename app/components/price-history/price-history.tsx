import { TextStyle, ViewStyle } from "node_modules/@types/react-native/index"
import * as React from "react"
import { ActivityIndicator, StyleProp, View } from "react-native"
import { CartesianChart, Line, useChartPressState } from "victory-native"
import type { SharedValue } from "react-native-reanimated"

import { gql } from "@apollo/client"
import { PricePoint, useBtcPriceListQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "@app/utils/testProps"
import { Button } from "@rneui/base"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { Circle } from "@shopify/react-native-skia"

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
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()
  const [graphRange, setGraphRange] = React.useState<GraphRangeType>(GraphRange.ONE_DAY)

  const { error, loading, data } = useBtcPriceListQuery({
    fetchPolicy: "no-cache",
    variables: { range: graphRange },
  })
  const priceList = data?.btcPriceList ?? []

  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } })

  function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
    return <Circle cx={x} cy={y} r={8} color={colors.secondary} />
  }

  if (error) {
    return <Text>{`${error}`}</Text>
  }

  if (loading || data === null || data?.btcPriceList === null) {
    return (
      <View style={styles.verticalAlignment}>
        <ActivityIndicator animating size="large" color={colors.primary} />
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

  const currentPriceData = prices[prices.length - 1].price
  const startPriceData = prices[0].price
  const price =
    (currentPriceData.base / 10 ** currentPriceData.offset) *
    multiple(currentPriceData.currencyUnit)
  const delta = currentPriceData.base / startPriceData.base - 1
  const color = delta > 0 ? { color: colors._green } : { color: colors.red }

  const prices2 = prices.map((index) => ({
    y: (index.price.base / 10 ** index.price.offset) * multiple(index.price.currencyUnit),
  }))

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
      <View>
        <View {...testProps(LL.PriceHistoryScreen.satPrice())} style={styles.textView}>
          <Text type="p1">{LL.PriceHistoryScreen.satPrice()}</Text>
          <Text type="p1" bold>
            ${price.toFixed(2)}
          </Text>
        </View>
        <View style={styles.textView}>
          <Text type="p1" style={[styles.delta, color]}>
            {(delta * 100).toFixed(2)}%{" "}
          </Text>
          <Text type="p1" {...testProps("range")}>
            {label()}
          </Text>
        </View>
      </View>
      <View style={styles.chart}>
        {
          /* eslint @typescript-eslint/ban-ts-comment: "off" */
          // @ts-ignore-next-line no-implicit-any error
          <CartesianChart data={prices2} yKeys={["y"]} chartPressState={state}>
            {({ points }) => (
              <>
                <Line points={points.y} color={colors.primary} strokeWidth={3} />
                {isActive && <ToolTip x={state.x.position} y={state.y.y.position} />}
              </>
            )}
          </CartesianChart>
        }
      </View>
      <View style={styles.pricesContainer}>
        <Button
          {...testProps(LL.PriceHistoryScreen.oneDay())}
          title={LL.PriceHistoryScreen.oneDay()}
          /* eslint @typescript-eslint/ban-ts-comment: "off" */
          // @ts-ignore-next-line no-implicit-any error
          buttonStyle={buttonStyleForRange(GraphRange.ONE_DAY)}
          // @ts-ignore-next-line no-implicit-any error
          titleStyle={titleStyleForRange(GraphRange.ONE_DAY)}
          onPress={() => setGraphRange(GraphRange.ONE_DAY)}
        />
        <Button
          {...testProps(LL.PriceHistoryScreen.oneWeek())}
          title={LL.PriceHistoryScreen.oneWeek()}
          // @ts-ignore-next-line no-implicit-any error
          buttonStyle={buttonStyleForRange(GraphRange.ONE_WEEK)}
          // @ts-ignore-next-line no-implicit-any error
          titleStyle={titleStyleForRange(GraphRange.ONE_WEEK)}
          onPress={() => setGraphRange(GraphRange.ONE_WEEK)}
        />
        <Button
          {...testProps(LL.PriceHistoryScreen.oneMonth())}
          title={LL.PriceHistoryScreen.oneMonth()}
          // @ts-ignore-next-line no-implicit-any error
          buttonStyle={buttonStyleForRange(GraphRange.ONE_MONTH)}
          // @ts-ignore-next-line no-implicit-any error
          titleStyle={titleStyleForRange(GraphRange.ONE_MONTH)}
          onPress={() => setGraphRange(GraphRange.ONE_MONTH)}
        />
        <Button
          {...testProps(LL.PriceHistoryScreen.oneYear())}
          title={LL.PriceHistoryScreen.oneYear()}
          // @ts-ignore-next-line no-implicit-any error
          buttonStyle={buttonStyleForRange(GraphRange.ONE_YEAR)}
          // @ts-ignore-next-line no-implicit-any error
          titleStyle={titleStyleForRange(GraphRange.ONE_YEAR)}
          onPress={() => setGraphRange(GraphRange.ONE_YEAR)}
        />
        <Button
          {...testProps(LL.PriceHistoryScreen.fiveYears())}
          title={LL.PriceHistoryScreen.fiveYears()}
          // @ts-ignore-next-line no-implicit-any error
          buttonStyle={buttonStyleForRange(GraphRange.FIVE_YEARS)}
          // @ts-ignore-next-line no-implicit-any error
          titleStyle={titleStyleForRange(GraphRange.FIVE_YEARS)}
          onPress={() => setGraphRange(GraphRange.FIVE_YEARS)}
        />
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  buttonStyleTime: {
    backgroundColor: colors.transparent,
    borderRadius: 40,
    width: 48,
    height: 48,
  },

  buttonStyleTimeActive: {
    backgroundColor: colors.primary,
    borderRadius: 40,
    width: 48,
    height: 48,
  },

  chart: {
    height: "70%",
  },

  delta: {
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
  },

  titleStyleTime: {
    color: colors.grey3,
  },

  verticalAlignment: {
    flex: 1,
    justifyContent: "space-between",
  },
}))
