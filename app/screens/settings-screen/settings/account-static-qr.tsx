import { Linking } from "react-native"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { useSettingsScreenQuery } from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { toastShow } from "@app/utils/toast"
import Clipboard from "@react-native-clipboard/clipboard"

import { SettingsRow } from "../row"

export const AccountStaticQR: React.FC = () => {
  const { appConfig } = useAppConfig()
  const posUrl = appConfig.galoyInstance.posUrl

  const { LL } = useI18nContext()

  const { data, loading } = useSettingsScreenQuery()
  if (!data?.me?.username) return <></>

  const qrUrl = `${posUrl}/${data.me.username}/print`

  return (
    <SettingsRow
      loading={loading}
      title={LL.SettingsScreen.staticQr()}
      extraComponentBesideTitle={<GaloyIcon name="link" size={20} />}
      subtitle={qrUrl}
      subtitleShorter={true}
      leftIcon="qr-code-outline"
      rightIcon="copy-outline"
      rightIconAction={() => {
        Clipboard.setString(qrUrl)
        toastShow({
          type: "success",
          message: (translations) => translations.SettingsScreen.staticQrCopied(),
          LL,
        })
      }}
      action={() => {
        Linking.openURL(qrUrl)
      }}
    />
  )
}
