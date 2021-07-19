import * as React from "react"
import { BackHandler } from "react-native"
import { inject, observer } from "mobx-react"
import { CommonActions } from "@react-navigation/native"
import { NavigationStore } from "../navigation/navigation-store"

interface BackButtonHandlerProps {
  navigationStore?: NavigationStore
  /**
   * Are we allowed to exit?
   */
  canExit(routeName: string): boolean
}

@inject("navigationStore")
@observer
export class BackButtonHandler extends React.Component<BackButtonHandlerProps> {
  /**
   * Subscribe when we come to life.
   */
  componentDidMount(): void {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress)
  }

  /**
   * Unsubscribe when we're done.
   */
  componentWillUnmount(): void {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress)
  }

  /**
   * Fires when the back button is pressed on android.
   */
  onBackPress = (): boolean => {
    // grab the current route
    const { routeName } = this.props.navigationStore.findCurrentRoute()

    // are we allowed to exit?
    if (this.props.canExit(routeName)) {
      // let the system know we've not handled this event
      return false
    }
    // we can't exit, so let's turn this into a back action
    this.props.navigationStore.dispatch(CommonActions.back())
    // let the system know we've handled this event
    return true
  }

  /**
   * Renders the children or nothing if they weren't passed.
   */
  render(): React.ReactNode {
    return this.props.children
  }
}
