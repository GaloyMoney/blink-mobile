import * as React from "react"
import { observer, inject } from "mobx-react"
import { Screen } from "../../components/screen"
import { NavigationScreenProps, withNavigation } from "react-navigation"
import { Button, Text } from "react-native"
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

    this.createUser = this.createUser.bind(this)
    this.onAuthStateChange = this.onAuthStateChange.bind(this)

    firebase.auth().onAuthStateChanged(this.onAuthStateChange)
  }

  onAuthStateChange(user) {
    console.tron.log("state change called")
    console.tron.log(user)
    if (user == undefined) {
      this.props.dataStore.auth.setEmailVerified(false)
      this.props.dataStore.auth.setEmail("nicolas.burtey+default@gmail.com")
      this.props.dataStore.auth.setIsAnonymous(true)
    } else {
      this.props.dataStore.auth.setEmailVerified(user.emailVerified)
      this.props.dataStore.auth.setEmail(user.email)
      this.props.dataStore.auth.setIsAnonymous(user.isAnonymous)
    }
  };

  createUser() {

    firebase.auth().createUserWithEmailAndPassword(this.props.dataStore.auth.email, password)
            .then(userCredential => {
                self.uid = userCredential.user.uid
                userCredential.user.sendEmailVerification();
            })
            .catch(err => { console.tron.log("2qwe", err) ; return "ok" } )


    this.props.dataStore.auth.signUp(this.state.password).then(() => {
      console.tron.log("done")
    })
    
    
    // .then(result => {
    //   console.tron.log("result: " + result)
    // })
    // .catch(err => console.tron.log("err: " + err))   
    // this.props.navigation.navigate('verifyEmail')

  }

  login() {
    // firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
    // .then(userCredential => {
    //   console.tron.log(userCredential)
    // }) 
  }  


  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
  }

  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    // const userToken = await AsyncStorage.getItem('userToken');
    // this.props.navigation.navigate(userToken ? 'App' : 'Auth');

    console.tron.log(firebase.auth().currentUser)
  };

  render () {
    const { password } = this.state;

    return (

      <Screen>

        <Input placeholder="email" value={this.props.dataStore.auth.email} 
          onChangeText={email => this.props.dataStore.auth.setEmail({ email })} />
        <Input placeholder="password" value={password} onChangeText={password => this.setState({ password })} />

        <Button title="Sign up" onPress={() => this.createUser()}></Button>
        <Button title="Sign in" onPress={() => this.login()}></Button>
        <Button title="new screen" onPress={() => this.props.navigation.navigate('primaryStack')}></Button>
        <Button title="Log out" onPress={() => firebase.auth().signOut()}></Button>
        
        <Text></Text>
      </Screen>
    )
  }
}

export const WrappedLoginScreen = withNavigation(LoginScreen)
