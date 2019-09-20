import * as React from "react"
import { observer } from "mobx-react"
import { Screen } from "../../components/screen"
import { NavigationScreenProps, withNavigation } from "react-navigation"
import { Button, Text } from "react-native"
import { Input,  } from 'react-native-elements'

import firebase from 'react-native-firebase'


export interface LoginScreenProps extends NavigationScreenProps<{}> {
}

// @inject("mobxstuff")
@observer
class LoginScreen extends React.Component<LoginScreenProps, {}> {

  constructor(props) {
    super(props)

    this.state = {
      email: 'nicolas.burtey+123@gmail.com',
      password: '123456'
    }

    this.createUser = this.createUser.bind(this)

    firebase.auth().onAuthStateChanged(function(user) {
      console.tron.log(user)
      if (user == undefined) return

      if (user.emailVerified) {
        console.tron.log('Email is verified');
      }
      else {
        console.tron.log('Email is not verified');
      }
    });
  }

  createUser() {
    
    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
    .then(userCredential => {
      userCredential.user.email
      userCredential.user.sendEmailVerification();
      this.props.navigation.navigate('verifyEmail')
    })

  }

  login() {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
    .then(userCredential => {
      console.tron.log(userCredential)
    }) 
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
    const { email, password } = this.state;

    return (

      <Screen>

        <Input placeholder="email" value={email} onChangeText={email => this.setState({ email })} />
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
