import * as React from "react"
import { observer, inject } from "mobx-react"
import { Screen } from "../../components/screen"
import { NavigationScreenProps, withNavigation } from "react-navigation"
import { Button, Text, Alert } from "react-native"
import { Input } from 'react-native-elements'

import firebase from 'react-native-firebase'
import { DataStore } from "../../models/data-store"


export interface LoginScreenProps extends NavigationScreenProps<{}> {
  dataStore: DataStore
}

interface State {
  password: string
}

@inject("dataStore")
@observer
class LoginScreen extends React.Component<LoginScreenProps, State> {

  constructor(props) {
    super(props)

    this.state = {
      password: '123456'
    }

    this.unsubscribeHandle = null

    this.signUp = this.signUp.bind(this)
    this.onUserChanged = this.onUserChanged.bind(this)

    if (firebase.auth().currentUser) {
      firebase.auth().currentUser.reload()
        .catch(err => console.tron.warn(err))
    }
  }

  onUserChanged(user: any) { // TODO : User type
    console.tron.log(user)
    if (user === null) {
      this.props.dataStore.auth.set("nicolas.burtey+default@gmail.com", false, true, "")
    } else {
      this.props.dataStore.auth.set(user.email, user.emailVerified, user.isAnonymous, user.uid)

      // FIXME this initialized logic should probably not be here
      if(this.props.dataStore.auth.emailVerified === true) {
        this.props.navigation.navigate('primaryStack') // we are logged in and email verified
      } else {
        this.props.navigation.navigate('verifyEmail')
      }

    }
  }

  signUp() {

    firebase.auth().createUserWithEmailAndPassword(this.props.dataStore.auth.email, this.state.password)
      .then(userCredential => {
          userCredential.user.sendEmailVerification();
      })
      .catch(err => { console.tron.log(err) ; Alert.alert(err.code) } )
  }

  signIn() {
    firebase.auth().signInWithEmailAndPassword(this.props.dataStore.auth.email, this.state.password)
    .catch(err => Alert.alert(err.code))
  }  


  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  componentDidMount() {
    // this._bootstrapAsync();
    this.unsubscribeHandle = firebase.auth().onUserChanged(this.onUserChanged)
  }

  componentWillUnmount() {
    if (this.unsubscribeHandle) this.unsubscribeHandle();
  }

  _bootstrapAsync = async () => {
    // const userToken = await AsyncStorage.getItem('userToken');
    // this.props.navigation.navigate(userToken ? 'App' : 'Auth');

  };

  render () {
    const { password } = this.state;

    return (

      <Screen>

        <Input placeholder="email" value={this.props.dataStore.auth.email}
          onChangeText={email => this.props.dataStore.auth.setEmail(email)} />
        <Input placeholder="password" value={password} onChangeText={password => this.setState({ password })} />

        <Button title="Sign up" onPress={() => this.signUp()}></Button>
        <Button title="Sign in" onPress={() => this.signIn()}></Button>
        
        <Text></Text>
      </Screen>
    )
  }
}

export const WrappedLoginScreen = withNavigation(LoginScreen)
