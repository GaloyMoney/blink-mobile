import { createStackNavigator } from "react-navigation-stack"
import { PrimaryNavigator } from "./primary-navigator"

export const RootNavigator = createStackNavigator(
  {
    primaryStack: { screen: PrimaryNavigator },
  },
  {
    headerMode: "none",
    navigationOptions: { gesturesEnabled: false },
  },
)
