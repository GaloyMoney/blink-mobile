import * as React from "react"
import { observer, inject } from "mobx-react"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProp } from "react-navigation"
import { DataStore } from "../../models/data-store"
import auth from "@react-native-firebase/auth"
import { StyleSheet, View } from "react-native"

export interface VerifyEmailScreenProps extends NavigationScreenProp<{}> {
  dataStore: DataStore,
  email: string,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  text: {
    fontSize: 18,
    textAlign: "center",
  }
})

@inject("dataStore")
@observer
export class VerifyEmailScreen extends React.Component<VerifyEmailScreenProps, {}> {
  timer: NodeJS.Timeout
  
  componentDidMount() { // TODO auth().currentUser will probably no longer navigate correctly 
    this.timer = setInterval(() => auth().currentUser.reload(), 2000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render () {
    return (
      <Screen>
        <View style={styles.container}>
          <Text style={styles.text}>Verify your email</Text>
          <Text style={styles.text}>{this.props.email}</Text>
          <Text style={styles.text}>to continue</Text>
        </View>
      </Screen>
    )
  }
}
