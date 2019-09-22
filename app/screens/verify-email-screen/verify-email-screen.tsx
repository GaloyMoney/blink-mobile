import * as React from "react"
import { observer, inject } from "mobx-react"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProps } from "react-navigation"

export interface VerifyEmailScreenProps extends NavigationScreenProps<{}> {
}

@inject("dataStore")
@observer
export class VerifyEmailScreen extends React.Component<VerifyEmailScreenProps, {}> {
  render () {
    return (
      <Screen>
        <Text>Verify your email {this.props.dataStore.auth.email} to continue</Text>
      </Screen>
    )
  }
}
