import * as React from "react"
import { observer, inject } from "mobx-react"
import { Screen } from "../../components/screen"
import { NavigationScreenProps, withNavigation } from "react-navigation"
import { Button, Text, Alert } from "react-native"
import { Input } from 'react-native-elements'

import firebase from 'react-native-firebase'


export interface LoginScreenProps extends NavigationScreenProps<{}> {
}

@inject("dataStore")
@observer
class LoginScreen extends React.Component<LoginScreenProps, {}> {

  constructor(props) {
    super(props)

    this.state = {
      password: '123456'
    }

    this.signUp = this.signUp.bind(this)
    this.onUserChanged = this.onUserChanged.bind(this)

    if (firebase.auth().currentUser) {
      firebase.auth().currentUser.reload()
        .catch(err => console.tron.warn(err))
    }
    
    firebase.auth().onUserChanged(this.onUserChanged)
  }

  onUserChanged(user: any) { // TODO : User type
    console.tron.log(`state change called. user is idenfified: ${user !== null}`)
    console.tron.log(user)
    if (user === null) {
      this.props.dataStore.auth.setEmailVerified(false)
      this.props.dataStore.auth.setEmail("nicolas.burtey+default@gmail.com")
      this.props.dataStore.auth.setIsAnonymous(true)
      this.props.dataStore.auth.setUID("")
    } else {
      this.props.dataStore.auth.setEmailVerified(user.emailVerified)
      this.props.dataStore.auth.setEmail(user.email)
      this.props.dataStore.auth.setIsAnonymous(user.isAnonymous)
      this.props.dataStore.auth.setUID(user.uid)

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

  signOut() {
    firebase.auth().signOut()
    .then(result => {
      console.tron.log(result)
    })
    .catch(err => {
      console.tron.log(err)
      Alert.alert(err.code)
    })
  }

  login() {
    // firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
    // .then(userCredential => {
    //   console.tron.log(userCredential)
    // }) 

    // this.props.navigation.navigate('primaryStack')}

  }  


  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  componentDidMount() {
    // setTimeout(this._bootstrapAsync, 3000);
    this._bootstrapAsync();
    
  }

  _bootstrapAsync = async () => {
    // const userToken = await AsyncStorage.getItem('userToken');
    // this.props.navigation.navigate(userToken ? 'App' : 'Auth');

    // console.tron.log(firebase.auth().currentUser)
  };

  render () {
    const { password } = this.state;

    return (

      <Screen>

        <Input placeholder="email" value={this.props.dataStore.auth.email}
          onChangeText={email => this.props.dataStore.auth.setEmail(email)} />
        <Input placeholder="password" value={password} onChangeText={password => this.setState({ password })} />

        <Button title="Sign up" onPress={() => this.signUp()}></Button>
        <Button title="Sign in" onPress={() => this.login()}></Button>
        <Button title="Log out" onPress={() => this.signOut()}></Button>
        
        <Text></Text>
      </Screen>
    )
  }
}

export const WrappedLoginScreen = withNavigation(LoginScreen)
