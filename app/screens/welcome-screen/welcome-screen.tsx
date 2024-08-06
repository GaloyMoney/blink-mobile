/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-unused-styles */
import * as React from "react"
import { Dimensions, TouchableOpacity, View } from "react-native"
import ReanimatedCarousel from "react-native-reanimated-carousel"
import { Screen } from "../../components/screen"
import { makeStyles, Image } from "@rneui/themed"
import { Props } from "./index.types"
import { useIsAuthed } from "@app/graphql/is-authed-context"

const { width, height } = Dimensions.get("window")

const useStyles = makeStyles(({ colors }) => ({
  flex: {
    flex: 1,
  },
  cover: {
    top: height < 560 ? "-25%" : 0,
    left: height < 560 ? "-7.5%" : 0,
    width: height < 560 ? "115%" : "100%",
    height: height < 560 ? "115%" : "100%",
    resizeMode: height < 560 ? "contain" : "cover",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },
  touchableArea: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "12%",
  },
  touchableAreaSkip: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "25%",
    height: "10%",
  },
}))

export const WelcomeFirstScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useStyles()
  const [currentIndex, setCurrentIndex] = React.useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carouselRef = React.useRef<any>(null)
  const isAuthed = useIsAuthed()
  console.log("currentIndex: ", currentIndex)

  const handlePress = (index: number) => {
    if (index < 2) {
      setCurrentIndex(index + 1)
    } else if (isAuthed) {
      navigation.navigate("Primary")
    } else {
      navigation.navigate("getStarted")
    }
  }

  React.useEffect(() => {
    // Scroll to the updated index when currentIndex changes
    carouselRef.current?.scrollTo({ index: currentIndex, animated: true })
  }, [currentIndex])

  const renderItem = ({ index }: { index: number }) => (
    <Screen statusBar="light-content">
      <View style={styles.container}>
        <Image
          source={
            index === 0
              ? require("@app/assets/images/welcome-1.png")
              : index === 1
              ? require("@app/assets/images/welcome-2.png")
              : require("@app/assets/images/welcome-3.png")
          }
          style={styles.cover}
        />
        <TouchableOpacity
          style={styles.touchableAreaSkip}
          onPress={() => handlePress(2)}
        />
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={() => handlePress(index)}
        />
      </View>
    </Screen>
  )

  return (
    <ReanimatedCarousel
      ref={carouselRef}
      width={width}
      height={height}
      data={[0, 1, 2]}
      renderItem={renderItem}
      onSnapToItem={(index) => setCurrentIndex(index)}
      pagingEnabled
      autoPlay={false}
      loop={false}
    />
  )
}
