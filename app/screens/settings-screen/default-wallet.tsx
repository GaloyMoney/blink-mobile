import { gql } from "@apollo/client"
import {
  useAccountUpdateDefaultWalletIdMutation,
  useSetDefaultWalletScreenQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { View } from "react-native"
import { Screen } from "../../components/screen"
import { testProps } from "../../utils/testProps"
import { GaloyInfo } from "@app/components/atomic/galoy-info"
import { Select, SelectItem } from "@app/components/select"

const useStyles = makeStyles(({ colors }) => ({
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

  const [newDefaultWalletId, setNewDefaultWalletId] = React.useState("")

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

  const handleSetDefaultWallet = async (id: string) => {
    if (loading) return
    if (id !== defaultWalletId) {
      await accountUpdateDefaultWallet({
        variables: {
          input: {
            walletId: id,
          },
        },
      })
      setNewDefaultWalletId(id)
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
      <Select
        value={newDefaultWalletId || defaultWalletId || ""}
        onChange={handleSetDefaultWallet}
      >
        {Wallets.map(({ name, id }) => (
          <SelectItem key={id} value={id} {...testProps(name)}>
            {name}
          </SelectItem>
        ))}
      </Select>
      <View style={styles.containerInfo}>
        <GaloyInfo>{LL.DefaultWalletScreen.info()}</GaloyInfo>
      </View>
    </Screen>
  )
}
