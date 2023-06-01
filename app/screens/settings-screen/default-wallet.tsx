import { gql } from "@apollo/client"
import {
  useAccountUpdateDefaultWalletIdMutation,
  useSetDefaultWalletScreenQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ListItem, Text, makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { ActivityIndicator, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { testProps } from "../../utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { GaloyInfo } from "@app/components/atomic/galoy-info"

const useStyles = makeStyles(({ colors }) => ({
  viewSelectedIcon: { width: 18 },

  container: { backgroundColor: colors.white },

  text: {
    color: colors.black,
  },

  containerInfo: {
    margin: 20,
  },

  iconStyle: {
    marginBottom: 8,
    flex: 1,
  },
}))

gql`
  mutation accountUpdateDefaultWalletId($input: AccountUpdateDefaultWalletIdInput!) {
    accountUpdateDefaultWalletId(input: $input) {
      errors {
        message
      }
      account {
        id
        defaultWalletId
      }
    }
  }

  query setDefaultWalletScreen {
    me {
      id
      defaultAccount {
        id
        defaultWalletId
        btcWallet @client {
          id
        }
        usdWallet @client {
          id
        }
      }
    }
  }
`

export const DefaultWalletScreen: React.FC = () => {
  const { LL } = useI18nContext()
  const styles = useStyles()
  const isAuthed = useIsAuthed()
  const {
    theme: { colors },
  } = useTheme()

  const [newDefaultWallet, setNewDefaultWallet] = React.useState("")

  const { data } = useSetDefaultWalletScreenQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id
  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id
  const defaultWalletId = data?.me?.defaultAccount?.defaultWalletId

  const [accountUpdateDefaultWallet, { loading }] =
    useAccountUpdateDefaultWalletIdMutation()

  if (!usdWalletId || !btcWalletId) {
    return <Text>{"missing walletIds"}</Text>
  }

  const handleSetDefaultWallet = (id: string) => {
    if (id !== defaultWalletId) {
      setNewDefaultWallet(id)
      accountUpdateDefaultWallet({
        variables: {
          input: {
            walletId: id,
          },
        },
      })
    }
  }

  const Wallets = [
    {
      // TODO: translation
      name: "Bitcoin",
      id: btcWalletId,
    },
    {
      name: "Stablesats (USD)",
      id: usdWalletId,
    },
  ] as const

  return (
    <Screen preset="scroll">
      {Wallets.map(({ name, id }) => (
        <ListItem
          key={id}
          bottomDivider
          containerStyle={styles.container}
          onPress={() => handleSetDefaultWallet(id)}
        >
          <View style={styles.viewSelectedIcon}>
            {newDefaultWallet === id && loading ? (
              <ActivityIndicator />
            ) : (
              defaultWalletId === id && (
                <Icon name="ios-checkmark-circle" size={18} color={colors.green} />
              )
            )}
          </View>
          <ListItem.Title {...testProps(name)} style={styles.text}>
            {name}
          </ListItem.Title>
        </ListItem>
      ))}
      <View style={styles.containerInfo}>
        <GaloyInfo>{LL.DefaultWalletScreen.info()}</GaloyInfo>
      </View>
    </Screen>
  )
}
