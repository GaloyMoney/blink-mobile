import { useState } from "react"
import { useI18nContext } from "@app/i18n/i18n-react"

import { SettingsRow } from "../row"
import { ShowNostrSecret } from "../show-nostr-secret"

export const NostrSecret: React.FC = () => {
  const { LL } = useI18nContext()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const toggleModal = () => setIsModalVisible((x) => !x)
  const isRowHidden = true // You can change this to false when we are ready to show nostr keys

  return (
    <>
      {!isRowHidden && (
        <SettingsRow
          title={LL.SettingsScreen.showNostrSecret()}
          leftIcon="globe-outline"
          rightIcon={null}
          action={toggleModal}
        />
      )}
      <ShowNostrSecret isActive={isModalVisible} onCancel={toggleModal} />
    </>
  )
}
