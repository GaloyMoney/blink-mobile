import Clipboard from "@react-native-clipboard/clipboard"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { SettingsRow } from "../row"

import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"

import { gql } from "@apollo/client"
import { useAccountPosQuery } from "@app/graphql/generated"
import { toastShow } from "@app/utils/toast"
import { Linking } from "react-native"

gql`
  query AccountPOS {
    me {
      username
    }
  }
`

export const AccountPOS: React.FC = () => {
  const { appConfig } = useAppConfig()
  const posUrl = appConfig.galoyInstance.posUrl

  const { LL } = useI18nContext()

  const { data, loading } = useAccountPosQuery()
  if (!data?.me?.username) return <></>

  const pos = `${posUrl}/${data.me.username}`

  return (
    <SettingsRow
      loading={loading}
      title={LL.SettingsScreen.pos()}
      extraComponentBesideTitle={
        <>
          {" "}
          <GaloyIcon name="link" size={20} />
        </>
      }
      subtitle={pos}
      subtitleShorter={data.me.username.length > 22}
      leftIcon="calculator"
      rightIcon="copy-outline"
      rightIconAction={() => {
        Clipboard.setString(posUrl)
        toastShow({
          type: "success",
          message: (translations) => translations.SettingsScreen.posCopied(),
          LL,
        })
      }}
      action={() => {
        Linking.openURL(pos)
      }}
    />
  )
}
