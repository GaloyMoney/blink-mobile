import React, { useState, useEffect, useRef } from "react"
import { Button, ActivityIndicator } from "react-native"
import {
  ListItem,
  makeStyles,
  Icon,
  Avatar,
  Text,
  useTheme,
  Overlay,
} from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { SettingsRow } from "../row"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { GaloyIcon } from "@app/components/atomic/galoy-icon/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button/galoy-icon-button"
import {
  UsernameQuery,
  useUserLogoutMutation,
  useUsernameLazyQuery,
} from "@app/graphql/generated"
import { useApolloClient, gql } from "@apollo/client"
import KeyStoreWrapper from "../../../utils/storage/secureStorage"
import { logLogout } from "@app/utils/analytics"
import crashlytics from "@react-native-firebase/crashlytics"

gql`
  query username {
    me {
      username
    }
  }
`

type ProfileProps = {
  userid?: string | null
  username: string
  token: string
  selected?: boolean
  avatarurl?: string
}

export const SwitchAccount: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { persistentState } = usePersistentStateContext()
  const { galoyAuthToken: curToken } = persistentState

  const [fetchUsername, { error, refetch }] = useUsernameLazyQuery({
    fetchPolicy: "no-cache",
  })
  const [profiles, setProfiles] = useState<ProfileProps[]>([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)

  const prevTokenRef = useRef<string>(persistentState.galoyAuthToken)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (!expanded) return
      setProfiles([])
      const profiles: ProfileProps[] = []
      const allTokens = (await KeyStoreWrapper.getAllTokens()).reverse()
      let counter = 1

      for (const token of allTokens) {
        try {
          const { data } = await fetchUsername({
            context: { headers: { authorization: `Bearer ${token}` } },
          })

          if (data?.me) {
            const existingProfileIndex = findExistingProfileIndex(profiles, data)

            if (existingProfileIndex === -1) {
              profiles.push(createProfile(data, token, counter))
            } else {
              // Avoid duplicate account data and clear store
              await KeyStoreWrapper.updateAllTokens(token)
            }
            counter = counter + 1
          } else {
            // Remove token if invalid
            await KeyStoreWrapper.updateAllTokens(token)
          }
        } catch (err) {
          console.error(`Failed to fetch username for token ${token}`, err)
        }
      }
      setProfiles(profiles)
      setLoading(false)
    })()
  }, [expanded, curToken, fetchUsername])

  const findExistingProfileIndex = (
    profiles: ProfileProps[],
    userData: UsernameQuery,
  ) => {
    return profiles.findIndex(
      (profile) =>
        profile.username === userData.me?.username ||
        profile.username === userData.me?.phone,
    )
  }

  const createProfile = (userData: UsernameQuery, token: string, counter: number) => ({
    userid: userData.me?.id,
    username:
      userData.me?.username ||
      userData.me?.phone ||
      `${LL.common.blinkUser()} ${counter}`,
    token,
    selected: token === curToken,
  })

  useEffect(() => {
    if (prevTokenRef.current !== persistentState.galoyAuthToken) {
      // Navigate to home when token is updated and different from the previous token
      navigation.navigate("Primary")
    }
    prevTokenRef.current = persistentState.galoyAuthToken // Update previous token
  }, [persistentState.galoyAuthToken, navigation])

  const handleAddNew = () => {
    navigation.navigate("getStarted")
  }

  return (
    <>
      <SettingsRow
        title={LL.AccountScreen.switchAccount()}
        leftIcon="people"
        action={() => setExpanded(!expanded)}
        expanded={expanded}
      />

      {expanded &&
        (loading ? (
          <ActivityIndicator
            size="large"
            style={styles.loadingIcon}
            color={styles.loadingIconColor.color}
          />
        ) : error ? (
          <>
            <Text adjustsFontSizeToFit style={styles.errorText}>
              {LL.ProfileScreen.error()}
            </Text>
            <Button
              title="reload"
              disabled={loading}
              color={colors.error}
              onPress={() => refetch()}
            />
          </>
        ) : (
          <>
            {profiles.map((profile, index) => {
              return <Profile key={index} {...profile} />
            })}

            <ListItem
              bottomDivider
              onPress={handleAddNew}
              containerStyle={styles.listItem}
            >
              <Icon name="add" size={25} type="ionicon" />
              <ListItem.Content>
                <ListItem.Title>{LL.ProfileScreen.addAccount()}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </>
        ))}
    </>
  )
}

const Profile: React.FC<ProfileProps> = ({ username, token, selected, avatarurl }) => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false)
  const [switchLoading, setSwitchLoading] = useState<boolean>(false)
  const { updateState } = usePersistentStateContext()
  const client = useApolloClient()
  const [userLogoutMutation] = useUserLogoutMutation({
    fetchPolicy: "no-cache",
  })

  const handleLogout = async () => {
    setLogoutLoading(true)
    await logOut(token)

    // Remove token
    await KeyStoreWrapper.updateAllTokens(token)
    navigation.navigate("Primary")
    setLogoutLoading(false)
  }
  const logOut = async (deviceToken: string) => {
    try {
      logLogout()
      await Promise.race([
        userLogoutMutation({
          variables: { input: { deviceToken } },
          context: { headers: { authorization: `Bearer ${token}` } },
        }),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Logout mutation timeout"))
          }, 2000)
        }),
      ])
    } catch (err: unknown) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
        console.debug({ err }, `error logout`)
      }
    }
  }

  const handleProfileSwitch = () => {
    setSwitchLoading(true)
    updateState((state) => {
      if (state) {
        return {
          ...state,
          galoyAuthToken: token,
        }
      }
      return state
    })
    client.clearStore() // clear cache to load fresh data using new token
    setSwitchLoading(false)
  }

  return (
    <>
      <ListItem
        bottomDivider
        onPress={handleProfileSwitch}
        containerStyle={styles.listItem}
        style={selected && styles.listItemSelected}
      >
        {avatarurl ? (
          <Avatar rounded source={{ uri: avatarurl }} size={44} />
        ) : (
          <GaloyIcon name="user" size={30} backgroundColor={styles.iconColor.color} />
        )}
        <ListItem.Content>
          <ListItem.Title>{username}</ListItem.Title>
        </ListItem.Content>

        {selected === false ? (
          <>
            {logoutLoading ? (
              <ActivityIndicator size="large" color={styles.loadingIconColor.color} />
            ) : (
              <GaloyIconButton
                name="close"
                size="medium"
                onPress={handleLogout}
                backgroundColor={styles.iconColor.color}
              />
            )}
          </>
        ) : null}
      </ListItem>
      <Overlay isVisible={switchLoading} overlayStyle={styles.overlayStyle}>
        <ActivityIndicator size={50} color={styles.loadingIconColor.color} />
        <Text>{LL.AccountScreen.pleaseWait()}</Text>
      </Overlay>
    </>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  listItem: {
    backgroundColor: colors.grey4,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey3,
  },
  listItemSelected: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  iconColor: {
    color: colors.grey5,
  },
  errorWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
    marginBottom: "50%",
  },
  errorText: {
    color: colors.error,
    fontWeight: "bold",
    fontSize: 15,
    margin: 12,
    textAlign: "center",
  },
  loadingIcon: {
    margin: 15,
  },
  loadingIconColor: {
    color: colors.primary,
  },
  overlayStyle: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
  },
}))
