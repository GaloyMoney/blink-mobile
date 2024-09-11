import React from "react"
import { View, StyleSheet } from "react-native"
import { makeStyles } from "@rneui/themed"
import Video from "react-native-video"

type Props = {
  isAnimating: boolean
}

const SendingAnimation: React.FC<Props> = ({ isAnimating }) => {
  const styles = useStyles()

  if (isAnimating) {
    return (
      <View style={styles.overlay}>
        <Video
          source={require("@app/assets/videos/flash-send.mp4")}
          style={styles.backgroundVideo}
          rate={2.0}
          volume={1.0}
          muted={false}
          resizeMode="cover"
          repeat={true}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
        />
        <View style={styles.semiTransparentOverlay} />
      </View>
    )
  } else {
    return null
  }
}

export default SendingAnimation

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // 50% Background transparency
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Ensures the view is on top
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  semiTransparentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // This creates the semi-transparent effect
  },
}))
