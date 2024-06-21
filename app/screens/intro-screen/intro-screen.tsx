import React, { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import Video from "react-native-video"
import { StackNavigationProp } from "@react-navigation/stack"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { usePersistentStateContext } from "@app/store/persistent-state"

type IntroScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "IntroScreen">
}

const IntroScreen: React.FC<IntroScreenProps> = ({ navigation }) => {
  const isAuthed = useIsAuthed()
  const { updateState } = usePersistentStateContext()
  const [introFinished, setIntroFinished] = useState(false)

  useEffect(() => {
    updateState((state: any) => {
      if (state)
        return {
          ...state,
          introVideoCount: state?.introVideoCount ? state?.introVideoCount + 1 : 1,
        }
      return undefined
    })
  }, [])

  useEffect(() => {
    if (introFinished) {
      const nextScreen = isAuthed ? "authenticationCheck" : "getStarted"
      navigation.replace(nextScreen)
    }
  }, [introFinished, isAuthed, navigation])

  return (
    <View style={styles.container}>
      <Video
        source={require("@app/assets/videos/flash-logo.mp4")}
        style={styles.video}
        resizeMode="cover"
        onEnd={() => setIntroFinished(true)}
        onLoad={() => console.log("Video loaded")}
        onError={(e: any) => console.error("Error loading video", e)}
        // You can set the video to not show controls, if desired
        controls={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
})

export default IntroScreen
