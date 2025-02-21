import React, { useState, useEffect, useRef } from "react"
import { Button, ActivityIndicator } from "react-native"
import { ListItem, makeStyles, Icon, Avatar, Text, useTheme } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { SettingsRow } from "../row"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { GaloyIcon } from "@app/components/atomic/galoy-icon/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button/galoy-icon-button"
import { useUsernameLazyQuery } from "@app/graphql/generated"
import { useApolloClient, gql } from "@apollo/client"
import KeyStoreWrapper from "../../../utils/storage/secureStorage"

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
      if (!expanded) return
      setLoading(true)

      // Avoid duplicate account data
      setProfiles([])
      const profiles: ProfileProps[] = []
      const allTokens = await KeyStoreWrapper.getAllTokens()
      let counter = 1
  
      for await (const token of allTokens) {
        try {
          const { data } = await fetchUsername({
            context: { headers: { authorization: `Bearer ${token}` } },
          })

          if (data?.me) {
            profiles.push({
              userid: data.me?.id,
              username:
                data.me.username ||
                data.me.phone ||
                `${LL.common.blinkUser()} ${counter++}`,
              token,
              selected: token === curToken,
            })
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

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (loading) {
        e.preventDefault()
      }
    })

    return unsubscribe
  }, [navigation, loading])

  useEffect(() => {
    if (prevTokenRef.current !== persistentState.galoyAuthToken) {
      // Navigate back when token is updated and different from the previous token
      navigation.goBack()
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
          <ActivityIndicator size="large" style={styles.loadingIcon} />
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
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { updateState } = usePersistentStateContext()
  const client = useApolloClient()

  const handleLogout = async () => {
    // Remove token
    await KeyStoreWrapper.updateAllTokens(token)
    navigation.goBack()
  }

  const handleProfileSwitch = () => {
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
  }

  return (
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

      {!selected ? (
        <GaloyIconButton
          name="close"
          size="medium"
          onPress={handleLogout}
          backgroundColor={styles.iconColor.color}
        />
      ) : null}
    </ListItem>
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
}))
