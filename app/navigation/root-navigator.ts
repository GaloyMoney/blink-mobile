import { createSwitchNavigator } from "react-navigation"
import { PrimaryNavigator } from "./primary-navigator"
import { AuthNavigator } from "./auth-navigator"

export const RootNavigator = createSwitchNavigator(
  {
    loginStack: { screen: AuthNavigator },
    primaryStack: { screen: PrimaryNavigator },
  },
)
