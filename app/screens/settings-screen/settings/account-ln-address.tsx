import { useState } from "react"
import Clipboard from "@react-native-clipboard/clipboard"

import { SettingsRow } from "../row"
import { SetLightningAddressModal } from "@app/components/set-lightning-address-modal"

import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"

import { gql } from "@apollo/client"
import { useAccountLnAddressQuery } from "@app/graphql/generated"
import { toastShow } from "@app/utils/toast"

gql`
  query AccountLNAddress {
    me {
      username
    }
  }
`

export const AccountLNAddress: React.FC = () => {
  const { appConfig } = useAppConfig()
  const hostName = appConfig.galoyInstance.lnAddressHostname

  const [isModalShown, setModalShown] = useState(false)
  const toggleModalVisibility = () => setModalShown((x) => !x)

  const { data, loading } = useAccountLnAddressQuery()

  const { LL } = useI18nContext()

  const hasUsername = Boolean(data?.me?.username)
  const lnAddress = `${data?.me?.username}@${hostName}`

  return (
    <>
      <SettingsRow
        loading={loading}
        title={
          hasUsername
            ? LL.SettingsScreen.yourAddress({ bankName })
            : LL.SettingsScreen.setYourAddress({ bankName })
        }
        subtitle={hasUsername ? lnAddress : undefined}
        subtitleShorter={(data?.me?.username || "").length > 22}
        leftIcon="at-outline"
        rightIcon={hasUsername ? "copy-outline" : undefined}
        action={() => {
          if (hasUsername) {
            Clipboard.setString(lnAddress)
            toastShow({
              type: "success",
              message: (translations) =>
                translations.GaloyAddressScreen.copiedAddressToClipboard({ bankName }),
              LL,
            })
          } else {
            toggleModalVisibility()
          }
        }}
      />
      <SetLightningAddressModal
        isVisible={isModalShown}
        toggleModal={toggleModalVisibility}
      />
    </>
  )
}
