import * as React from "react"
import { observer, inject } from "mobx-react"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProps } from "react-navigation"
import { DataStore } from "../../models/data-store"
import firebase from "react-native-firebase"
import { StyleSheet, View } from "react-native"
import style from "react-syntax-highlighter/dist/styles/hljs/atelier-cave-light"

export interface VerifyEmailScreenProps extends NavigationScreenProps<{}> {
  dataStore: DataStore
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    textAlign: "center",
  },

  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  }
})

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
        <View style={styles.container}>
          <Text style={styles.text}>Verify your email</Text>
          <Text style={styles.text}>{this.props.dataStore.auth.email}</Text>
          <Text style={styles.text}>to continue</Text>
        </View>
      </Screen>
    )
  }
}
