import { ScrollView } from "react-native-gesture-handler"
import { Screen } from "@app/components/screen"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { TouchableOpacity, View } from "react-native"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { makeStyles, Text } from "@rneui/themed"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useApolloClient } from "@apollo/client"

export const ProfileScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { persistentState } = usePersistentStateContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const data = persistentState.galoyAllAuthTokens.map((token) => {
    return { username: token, selected: false }
  })

  data.filter((token) => token.username === persistentState.galoyAuthToken)[0].selected =
    true

  const handleAddNew = () => {
    navigation.navigate("getStarted")
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScrollView contentContainerStyle={styles.outer}>
        {data.map((token, index) => {
          return <Profile key={index} {...token} />
        })}
        <GaloyPrimaryButton onPress={handleAddNew} containerStyle={styles.addNewButton}>
          <GaloyIcon name="user" size={30} style={styles.icon} />
          <Text>{LL.ProfileScreen.addNew()}</Text>
        </GaloyPrimaryButton>
      </ScrollView>
    </Screen>
  )
}

const Profile: React.FC<{ username: string; selected?: boolean }> = ({
  username,
  selected,
}) => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { updateState } = usePersistentStateContext()
  const client = useApolloClient()

  const handleLogout = () => {
    updateState((state) => {
      if (state) {
        return {
          ...state,
          galoyAllAuthTokens: state.galoyAllAuthTokens.filter(
            (token) => token !== username,
          ),
        }
      }
      return state
    })
  }

  const handleProfileSwitch = () => {
    updateState((state) => {
      if (state) {
        return {
          ...state,
          galoyAuthToken: username,
        }
      }
      return state
    })
    client.clearStore() // clears cache
  }

  return (
    <TouchableOpacity onPress={handleProfileSwitch}>
      <View style={styles.profile}>
        <View style={styles.iconContainer}>
          {selected && (
            <GaloyIcon name="check-circle" size={30} style={styles.checkIcon} />
          )}
        </View>
        <Text>{username}</Text>
        {!selected && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>{LL.ProfileScreen.logout()}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.divider}></View>
    </TouchableOpacity>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  outer: {
    marginTop: 4,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    rowGap: 12,
  },
  iconContainer: {
    height: 30,
    width: 30,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  addNewButton: {
    marginVertical: 20,
    marginHorizontal: "auto",
    width: 150,
  },
  divider: {
    borderWidth: 1,
    borderColor: colors.grey4,
  },
  profile: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 10,
  },
  checkIcon: {
    color: colors._green,
    margin: 10,
  },
  logoutButton: {
    marginLeft: "auto",
    marginRight: 10,
  },
  logoutButtonText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
}))
