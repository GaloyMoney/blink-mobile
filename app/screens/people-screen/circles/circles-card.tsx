import { ActivityIndicator, TouchableOpacity, View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { useNavigation } from "@react-navigation/native"
import { PeopleStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { useCirclesQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"

export const CirclesCard = () => {
  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<PeopleStackParamList>>()
  const { LL } = useI18nContext()

  const { data, loading } = useCirclesQuery()

  return (
    <TouchableOpacity onPress={() => navigation.navigate("circlesDashboard")}>
      <View style={styles.container}>
        <View>
          <View style={styles.blinkCircles}>
            <Text type="h2">{LL.Circles.titleBlinkCircles()}</Text>
          </View>
          <View style={styles.separator}></View>
        </View>
        <View>
          <Text type="p2" style={styles.textCenter}>
            {LL.Circles.circlesGrowingKeepGoing()}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Text style={styles.pointsNumber}>
                {data?.me?.defaultAccount.welcomeProfile?.allTimePoints ?? 0}
              </Text>
              <Text style={styles.pointsText} type="p2">
                {LL.Circles.points()}
              </Text>
            </>
          )}
        </View>
        <View style={styles.backdropCircle}></View>
      </View>
    </TouchableOpacity>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    rowGap: 14,
    position: "relative",
    overflow: "hidden",
  },
  blinkCircles: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: colors.grey4,
    marginTop: 8,
  },
  textCenter: {
    textAlign: "center",
  },
  pointsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    columnGap: 10,
  },
  pointsNumber: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 50,
  },
  pointsText: {
    paddingBottom: 8,
  },
  backdropCircle: {
    position: "absolute",
    right: -150,
    bottom: -150,
    height: 280,
    width: 280,
    borderRadius: 280 / 2,
    backgroundColor: colors.backdropWhite,
  },
}))
