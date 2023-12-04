import LottieView from "lottie-react-native"

import TestAnimation from "@app/assets/animations/test.json"

export const LottieAnimationScreen: React.FC = () => {
  return <LottieView style={{ height: "100%" }} source={TestAnimation} autoPlay loop />
}
