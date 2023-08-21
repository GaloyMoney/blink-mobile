import { ActivityIndicator, View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"
import { useNavigation } from "@react-navigation/native"
import { PeopleStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import { useCirclesQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"

export const CirclesCardPeopleHome = () => {
  const styles = useStyles()
  const navigation = useNavigation<StackNavigationProp<PeopleStackParamList>>()
  const { LL } = useI18nContext()

  const { data, loading } = useCirclesQuery({
    fetchPolicy: "network-only",
  })

  const peopleInInnerCircle =
    data?.me?.defaultAccount.welcomeProfile?.innerCircleAllTimeCount || 0
  const isLonely = peopleInInnerCircle === 0

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.blinkCircles}>
          <Text type="h2">{LL.Circles.titleBlinkCircles()}</Text>
        </View>
        <View style={styles.separator}></View>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <View>
            <Text type={isLonely ? "p1" : "p2"} style={styles.textCenter}>
              {isLonely ? LL.Circles.groupEffort() : LL.Circles.circlesGrowingKeepGoing()}
            </Text>
          </View>
          {!isLonely && (
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsNumber}>{peopleInInnerCircle}</Text>
              <Text style={styles.pointsText} type="p2">
                {LL.Circles.peopleYouWelcomed()}
              </Text>
            </View>
          )}
          <GaloySecondaryButton
            style={styles.viewCirclescta}
            title={LL.Circles.viewMyCircles()}
            onPress={() => navigation.navigate("circlesDashboard")}
          />
        </>
      )}
      <View style={styles.backdropCircle}></View>
    </View>
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
    paddingBottom: 0,
    rowGap: 14,
    justifyContent: "center",
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
    color: colors.black,
    fontWeight: "700",
    fontSize: 50,
  },
  pointsText: {
    paddingBottom: 8,
    maxWidth: 80,
  },
  backdropCircle: {
    position: "absolute",
    right: -150,
    bottom: -150,
    height: 280,
    width: 280,
    borderRadius: 280 / 2,
    backgroundColor: colors.backdropWhite,
    zIndex: -10,
  },
  viewCirclescta: {
    marginTop: -10,
  },
}))
