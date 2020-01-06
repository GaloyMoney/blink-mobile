import * as React from "react"
import { observer, inject } from "mobx-react"
import { Screen } from "../../components/screen"
import { NavigationScreenProp, withNavigation } from "react-navigation"
import { Text, Alert, StyleSheet, View } from "react-native"
import { Input, Button } from 'react-native-elements'

import auth from '@react-native-firebase/auth'
import { DataStore } from "../../models/data-store"
import { color } from "../../theme"
import { getEnv } from "mobx-state-tree"

export interface LoginScreenProps extends NavigationScreenProp<{}> {
  dataStore: DataStore
}

interface State {
  password: string
}

const styles = StyleSheet.create({
  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36,
    marginLeft: 0,
    width: '70%'
  },

  buttonContainer: {
    marginVertical: 12,
    width: "100%",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  form: {
    marginHorizontal: 32,
    marginVertical: 12,
  },

  signIn: {
    backgroundColor: color.primary
  },

  signUp: {
    color: color.text
  },

  sub: {
    fontSize: 18,
    marginBottom: 48,
  },

  title: {
    color: color.primary,
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 128,
  }

})

@inject("dataStore")
@observer
class _LoginScreen extends React.Component<LoginScreenProps, State> {
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
    this.props.dataStore.auth.set(user.email, user.emailVerified, user.isAnonymous, user.uid)
      
    // FIXME this initialized logic should probably not be here
    if (this.props.dataStore.auth.emailVerified === true) {
      this.props.navigation.navigate('primaryStack') // we are logged in and email verified
    } else if (this.props.dataStore.auth.email) {
      this.props.navigation.navigate('verifyEmail')
    }
  }

  signUp() {
    auth().createUserWithEmailAndPassword(this.props.dataStore.auth.email, this.state.password)
      .then(userCredential => {
        userCredential.user.sendEmailVerification()
      })
      .catch(err => { console.tron.log(err); Alert.alert(err.code) })
  }

  signIn() {
    auth().signInWithEmailAndPassword(this.props.dataStore.auth.email, this.state.password)
      .catch(err => Alert.alert(err.code))
  }

  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

  componentDidMount() {
    // this._bootstrapAsync();

    getEnv(this.props.dataStore).lnd.start()

    this.unsubscribeHandle = auth().onUserChanged(this.onUserChanged)
  }

  componentWillUnmount() {
    if (this.unsubscribeHandle) this.unsubscribeHandle()
  }

  _bootstrapAsync = async () => {
    // const userToken = await AsyncStorage.getItem('userToken');
    // this.props.navigation.navigate(userToken ? 'App' : 'Auth');

  };

  render () {
    const { password } = this.state

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
          textContentType="newPassword" // TODO(check how to integrate with iCloud keychain)
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

export const LoginScreen = withNavigation(_LoginScreen)
