import { gql } from "@apollo/client"
import {
  useAccountUpdateDefaultWalletIdMutation,
  useSetDefaultWalletScreenQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ListItem } from "@rneui/base"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { ActivityIndicator, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { Screen } from "../../components/screen"
import { palette } from "../../theme/palette"
import { testProps } from "../../utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

const useStyles = makeStyles((theme) => ({
  viewSelectedIcon: { width: 18 },

  container: { backgroundColor: theme.colors.white },

  text: {
    color: theme.colors.darkGreyOrWhite,
  },

  textDark: {
    color: theme.colors.white,
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
  const { theme } = useTheme()

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

  const Wallets = [
    {
      // TODO: translation
      name: "Bitcoin",
      id: btcWalletId,
    },
    {
      name: "StableSats (USD)",
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
          onPress={() => {
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
          }}
        >
          <View style={styles.viewSelectedIcon}>
            {(newDefaultWallet === defaultWalletId && loading && <ActivityIndicator />) ||
              (defaultWalletId === id && !loading && (
                <Icon name="ios-checkmark-circle" size={18} color={palette.green} />
              ))}
          </View>
          <ListItem.Title {...testProps(name)} style={styles.text}>
            {name}
          </ListItem.Title>
        </ListItem>
      ))}
      <View style={styles.containerInfo}>
        <GaloyIcon
          style={styles.iconStyle}
          name={"info"}
          size={20}
          color={theme.colors.primary}
        />
        <Text type="p1">{LL.DefaultWalletScreen.info()}</Text>
      </View>
    </Screen>
  )
}
