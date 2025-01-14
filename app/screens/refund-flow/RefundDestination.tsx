import React, { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { makeStyles, Text } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Network, parsePaymentDestination } from "@flash/client"
import { StackScreenProps } from "@react-navigation/stack"

// components
import { Screen } from "@app/components/screen"
import { DestinationField, Fees } from "@app/components/refund-flow"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"

// utils
import { LNURL_DOMAINS } from "@app/config"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// gql
import {
  useOnChainAddressCurrentMutation,
  usePaymentRequestQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getUsdWallet } from "@app/graphql/wallets-utils"

type Props = StackScreenProps<RootStackParamList, "RefundDestination">

const RefundDestination: React.FC<Props> = ({ navigation, route }) => {
  const styles = useStyles()
  const isAuthed = useIsAuthed()
  const { LL } = useI18nContext()

  const [selectedFee, setSelectedFee] = useState<number>()
  const [selectedFeeType, setSelectedFeeType] = useState<string>()
  const [destination, setDestination] = useState<string>()
  const [status, setStatus] = useState("entering")
  const [error, setError] = useState<string>()

  const [onChainAddressCurrent] = useOnChainAddressCurrentMutation()
  const { data } = usePaymentRequestQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const validateDestination = () => {
    if (!destination) {
      setError("Please, enter destination to proceed")
    } else if (!selectedFee || !selectedFeeType) {
      setError("Please, select fee to proceed")
    } else {
      setStatus("validating")
      const parsedDestination: any = parsePaymentDestination({
        destination,
        network: "mainnet" as Network,
        lnAddressDomains: LNURL_DOMAINS,
      })
      console.log("PARSED DESTINATION>>>>>>>>>>>>>", parsedDestination)
      if (parsedDestination.valid && parsedDestination.paymentType === "onchain") {
        setStatus("valid")
        navigation.navigate("RefundConfirmation", {
          swapAddress: route.params.swapAddress,
          amount: route.params.amount,
          destination,
          fee: selectedFee,
          feeType: selectedFeeType,
        })
      } else {
        setStatus("invalid")
        setError("Please, enter valid destination")
      }
    }
  }

  const navigateToScanning = () => {
    if (!!selectedFee) {
      navigation.navigate("scanningQRCode", {
        swapAddress: route.params.swapAddress,
        amount: route.params.amount,
        fee: selectedFee,
      })
    } else {
      setError("Please, select fee to proceed")
    }
  }

  const generateOnChainInvoice = async () => {
    if (!!usdWallet) {
      const result = await onChainAddressCurrent({
        variables: { input: { walletId: usdWallet?.id } },
      })
      if (result.data?.onChainAddressCurrent.address) {
        setDestination(result.data?.onChainAddressCurrent.address)
      }
    }
  }

  const onSelectFee = (type: string, value?: number) => {
    setSelectedFeeType(type)
    setSelectedFee(value)
  }

  return (
    <Screen
      preset="scroll"
      style={styles.screenStyle}
      keyboardOffset="navigationHeader"
      keyboardShouldPersistTaps="handled"
    >
      <DestinationField
        destination={destination}
        status={status}
        validateDestination={validateDestination}
        handleChangeText={setDestination}
        setDestination={setDestination}
        navigateToScanning={navigateToScanning}
      />
      {!!usdWallet && (
        <TouchableOpacity onPress={generateOnChainInvoice}>
          <Text style={styles.text}>{LL.RefundFlow.refundTo()}</Text>
        </TouchableOpacity>
      )}
      <Fees selectedFeeType={selectedFeeType} onSelectFee={onSelectFee} />
      <Text style={styles.errorMsg}>{error}</Text>
      <View style={styles.buttonContainer}>
        <GaloyPrimaryButton
          title={LL.common.next()}
          loading={status === "validating"}
          disabled={!destination || !selectedFee}
          onPress={validateDestination}
        />
      </View>
    </Screen>
  )
}

export default RefundDestination

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },

  text: { color: "#60aa55" },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  errorMsg: {
    color: colors.error,
  },
}))
