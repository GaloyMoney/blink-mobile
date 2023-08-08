import { View } from "react-native"

import { makeStyles, Text } from "@rneui/themed"

export const CirclesCard = () => {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.blinkCircles}>
          <Text type="h2">Blink Circles</Text>
        </View>
        <View style={styles.separator}></View>
      </View>
      <View>
        <Text type="p2" style={styles.textCenter}>
          Your circles grow as you onboard people to Blink – keep going!
        </Text>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsNumber}>740</Text>
        <Text style={styles.pointsText} type="p2">
          points
        </Text>
      </View>
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
