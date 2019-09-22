import * as React from "react"
import { observer, inject } from "mobx-react"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProps } from "react-navigation"
import { DataStore } from "../../models/data-store"
import firebase from "react-native-firebase"

export interface VerifyEmailScreenProps extends NavigationScreenProps<{}> {
  dataStore: DataStore
}

@inject("dataStore")
@observer
export class VerifyEmailScreen extends React.Component<VerifyEmailScreenProps, {}> {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.timer = setInterval(() => firebase.auth().currentUser.reload(), 2000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }  

  render () {
    return (
      <Screen>
        <Text>Verify your email {this.props.dataStore.auth.email} to continue</Text>
      </Screen>
    )
  }
}
