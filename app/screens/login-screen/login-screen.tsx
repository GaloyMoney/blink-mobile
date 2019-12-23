import * as React from "react"
import { observer, inject } from "mobx-react"
import { Screen } from "../../components/screen"
import { NavigationScreenProps, withNavigation } from "react-navigation"
import { Text, Alert, StyleSheet, View } from "react-native"
import { Input, Button } from 'react-native-elements'

import auth from '@react-native-firebase/auth'
import { DataStore } from "../../models/data-store"
import { color } from "../../theme"


export interface LoginScreenProps extends NavigationScreenProps<{}> {
  dataStore: DataStore
}

interface State {
  password: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },

  title: {
    color: color.primary,
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 128, 
    marginBottom: 24,
  },

  sub: {
    fontSize: 18,
    marginBottom: 48,
  },

  form: {
    marginHorizontal: 32,
    marginVertical: 12,
  },

  signUp: {
    color: color.text
  },

  signIn: {
    backgroundColor: color.primary
  },

  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36,
    alignItems: "center",
    width: '70%',
    marginLeft: 0
  },

  buttonContainer: {
    width: "100%",
    marginVertical: 12,
  }

})

@inject("dataStore")
@observer
class LoginScreen extends React.Component<LoginScreenProps, State> {

  constructor(props) {
    super(props)

    this.state = {
      password: ''
    }

    this.unsubscribeHandle = null

    this.signUp = this.signUp.bind(this)
    this.onUserChanged = this.onUserChanged.bind(this)

    if (auth().currentUser) {
      auth().currentUser.reload()
        .catch(err => console.tron.warn(err))
    }
  }

  onUserChanged(user: any) { // TODO : User type
    console.tron.log(user)
    if (user === null) {
      this.props.dataStore.auth.set("", false, true, "")
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

    auth().createUserWithEmailAndPassword(this.props.dataStore.auth.email, this.state.password)
      .then(userCredential => {
          userCredential.user.sendEmailVerification();
      })
      .catch(err => { console.tron.log(err) ; Alert.alert(err.code) } )
  }

  signIn() {
    auth().signInWithEmailAndPassword(this.props.dataStore.auth.email, this.state.password)
    .catch(err => Alert.alert(err.code))
  }  


  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  componentDidMount() {
    // this._bootstrapAsync();
    this.unsubscribeHandle = auth().onUserChanged(this.onUserChanged)
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

      <Screen style={styles.container}>
          <Text style={styles.title}>Galoy</Text>
          <Text style={styles.sub}>The bank built for crypto</Text>
          <Input placeholder="email" value={this.props.dataStore.auth.email}
            onChangeText={email => this.props.dataStore.auth.setEmail(email)}
            inputContainerStyle={styles.form}
            />
          <Input placeholder="password" value={password} 
            onChangeText={password => this.setState({ password })}
            inputContainerStyle={styles.form}
            textContentType="newPassword" //TODO(check how to integrate with iCloud keychain)
            secureTextEntry={true}
            />

          <View style={styles.bottom}>
            <Button title="Create an account" titleStyle={styles.signUp}
              onPress={() => this.signUp()} type="clear" containerStyle={styles.buttonContainer} />
            <Button title="Sign in" buttonStyle={styles.signIn}
              onPress={() => this.signIn()} containerStyle={styles.buttonContainer}/>
          </View>
      </Screen>
    )
  }
}

export const WrappedLoginScreen = withNavigation(LoginScreen)
