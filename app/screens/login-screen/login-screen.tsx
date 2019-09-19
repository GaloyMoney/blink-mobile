import * as React from "react"
import { observer } from "mobx-react"
import { Screen } from "../../components/screen"
import { NavigationScreenProps } from "react-navigation"

import firebase from 'react-native-firebase'
import { Button } from "react-native"


export interface LoginScreenProps extends NavigationScreenProps<{}> {
}

function createUser(email: string = "nicolas.burtey+123@gmail.com", password: string = "123456") {
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(userCredential => {
    console.tron.log(userCredential)
  })
  
}

// @inject("mobxstuff")
@observer
export class LoginScreen extends React.Component<LoginScreenProps, {}> {
  render () {
    return (
      <Screen preset="scroll">
        <Button title="Create user" onPress={() => createUser()}></Button>
        
      </Screen>
    )
  }
}
