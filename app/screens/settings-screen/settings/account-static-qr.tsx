import { Linking } from "react-native"

import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { useSettingsScreenQuery } from "@app/graphql/generated"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"

import { SettingsRow } from "../row"

export const AccountStaticQR: React.FC = () => {
  const { appConfig } = useAppConfig()
  const posUrl = appConfig.galoyInstance.posUrl
  const shortUrl = appConfig.galoyInstance.lnAddressHostname

  const { LL } = useI18nContext()

  const { data, loading } = useSettingsScreenQuery()
  if (!data?.me?.username) return <></>

  const qrUrl = `${posUrl}/${data.me.username}/print`
  const short = `${shortUrl}/${data.me.username}/print`

  return (
    <SettingsRow
      loading={loading}
      title={LL.SettingsScreen.staticQr()}
      subtitle={short}
      subtitleShorter={true}
      leftIcon="qr-code-outline"
      rightIcon={<GaloyIcon name="link" size={24} />}
      action={() => {
        Linking.openURL(qrUrl)
      }}
    />
  )
}
