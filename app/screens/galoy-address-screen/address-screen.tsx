import React from "react"
import { View } from "react-native"

import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import {
  getLightningAddress,
  getPosUrl,
  getPrintableQrCodeUrl,
} from "@app/utils/pay-links"
import { Button } from "@rneui/base"
import { makeStyles, Text, useTheme } from "@rneui/themed"

import { useAddressScreenQuery } from "../../graphql/generated"
import AddressComponent from "./address-component"
import { AddressExplainerModal } from "./address-explainer-modal"
import { PayCodeExplainerModal } from "./paycode-explainer-modal"
import { PosExplainerModal } from "./pos-explainer-modal"
import { SetAddressModal } from "./set-address-modal"

const useStyles = makeStyles(({ colors }) => ({
  container: {
    padding: 20,
  },
  addressInfoContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    rowGap: 60,
  },
  buttonContainerStyle: {
    marginTop: 20,
  },
  buttonStyle: {
    backgroundColor: colors.grey5,
    borderRadius: 8,
    height: 48,
  },
  title: {
    color: colors.grey5,
    fontSize: 18,
    lineHeight: 24,
    flexWrap: "wrap",
  },
}))

gql`
  query addressScreen {
    me {
      id
      username
    }
  }
`

export const GaloyAddressScreen = () => {
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()
  const { theme } = useTheme()
  const styles = useStyles(theme)
  const { data } = useAddressScreenQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const [chooseAddressModalVisible, setChooseAddressModalVisible] = React.useState(false)
  const { appConfig } = useAppConfig()
  const { name: bankName } = appConfig.galoyInstance

  const [explainerModalVisible, setExplainerModalVisible] = React.useState(false)
  const [isPosExplainerModalOpen, setIsPosExplainerModalOpen] = React.useState(false)
  const [isPaycodeExplainerModalOpen, setIsPaycodeExplainerModalOpen] =
    React.useState(false)

  const username = data?.me?.username || ""

  const lightningAddress = getLightningAddress(
    appConfig.galoyInstance.lnAddressHostname,
    username,
  )
  // const lightningAddress = getLightningAddress(appConfig.galoyInstance, username)
  const posUrl = getPosUrl(appConfig.galoyInstance.posUrl, username)
  const payCodeUrl = getPrintableQrCodeUrl(appConfig.galoyInstance.posUrl, username)

  const togglePosExplainerModal = () => {
    setIsPosExplainerModalOpen(!isPosExplainerModalOpen)
  }

  const togglePaycodeExplainerModal = () => {
    setIsPaycodeExplainerModalOpen(!isPaycodeExplainerModalOpen)
  }

  const toggleChooseAddressModal = () => {
    setChooseAddressModalVisible(!chooseAddressModalVisible)
  }

  const toggleExplainerModal = () => {
    setExplainerModalVisible(!explainerModalVisible)
  }

  return (
    <Screen preset="scroll">
      <View style={styles.container}>
        {username ? (
          <>
            <Text type={"h2"} bold style={styles.title}>
              {LL.GaloyAddressScreen.title()}
            </Text>
            <View style={styles.addressInfoContainer}>
              <AddressComponent
                addressType={"lightning"}
                address={lightningAddress}
                title={LL.GaloyAddressScreen.yourAddress({ bankName })}
                onToggleDescription={toggleExplainerModal}
              />
              <AddressComponent
                addressType={"pos"}
                address={posUrl}
                title={LL.GaloyAddressScreen.yourCashRegister()}
                useGlobeIcon={true}
                onToggleDescription={togglePosExplainerModal}
              />
              <AddressComponent
                addressType={"paycode"}
                address={payCodeUrl}
                title={LL.GaloyAddressScreen.yourPaycode()}
                useGlobeIcon={true}
                onToggleDescription={togglePaycodeExplainerModal}
              />
            </View>
          </>
        ) : (
          <>
            <Text type={"h2"} bold style={styles.title}>
              {LL.GaloyAddressScreen.buttonTitle({ bankName })}
            </Text>
            <Button
              title={LL.GaloyAddressScreen.buttonTitle({ bankName })}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={() => toggleChooseAddressModal()}
            />
          </>
        )}
      </View>
      <SetAddressModal
        modalVisible={chooseAddressModalVisible}
        toggleModal={toggleChooseAddressModal}
      />
      <AddressExplainerModal
        modalVisible={explainerModalVisible}
        toggleModal={toggleExplainerModal}
      />
      <PosExplainerModal
        modalVisible={isPosExplainerModalOpen}
        toggleModal={togglePosExplainerModal}
      />
      <PayCodeExplainerModal
        modalVisible={isPaycodeExplainerModalOpen}
        toggleModal={togglePaycodeExplainerModal}
      />
    </Screen>
  )
}
