import * as React from "react"
import { observer } from "mobx-react"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProps } from "react-navigation"

export interface VerifyEmailScreenProps extends NavigationScreenProps<{}> {
}

// @inject("mobxstuff")
@observer
export class VerifyEmailScreen extends React.Component<VerifyEmailScreenProps, {}> {
  render () {
    return (
      <Screen>
        <Text>Verify your email</Text>
      </Screen>
    )
  }
}
