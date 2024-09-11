import React, { useEffect } from "react"
import { TouchableOpacity } from "react-native"
import nfcManager from "react-native-nfc-manager"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { makeStyles, Text, useTheme } from "@rneui/themed"

// components
import { CustomIcon } from "@app/components/custom-icon"

// types
import { Invoice } from "@app/screens/receive-bitcoin-screen/payment/index.types"

// store
import { usePersistentStateContext } from "@app/store/persistent-state"

type Props = {
  request: any
  setDisplayReceiveNfc: (val: boolean) => void
}

const Header: React.FC<Props> = ({ request, setDisplayReceiveNfc }) => {
  const navigation = useNavigation()
  const styles = useStyles()
  const { colors } = useTheme().theme
  const { LL } = useI18nContext()
  const { persistentState } = usePersistentStateContext()

  useEffect(() => {
    if (persistentState.isAdvanceMode) {
      switch (request?.type) {
        case Invoice.OnChain:
          navigation.setOptions({ title: LL.ReceiveScreen.receiveViaOnchain() })
          break
        case Invoice.Lightning:
          navigation.setOptions({ title: LL.ReceiveScreen.receiveViaInvoice() })
          break
        case Invoice.PayCode:
          navigation.setOptions({ title: LL.ReceiveScreen.receiveViaPaycode() })
      }
    } else {
      navigation.setOptions({ title: LL.ReceiveScreen.receive() })
    }
  }, [request?.type])

  useEffect(() => {
    ;(async () => {
      if (
        request?.type === "Lightning" &&
        request?.state === "Created" &&
        (await nfcManager.isSupported())
      ) {
        console.log("DEBUG:", request.receiveViaNFC)
        navigation.setOptions({
          headerRight: () => (
            <TouchableOpacity
              style={styles.nfcIcon}
              onPress={() => setDisplayReceiveNfc(true)}
            >
              <Text type="p2">{LL.ReceiveScreen.nfc()}</Text>
              <CustomIcon name="nfc" color={colors.black} />
            </TouchableOpacity>
          ),
        })
      } else {
        navigation.setOptions({ headerRight: () => <></> })
      }
    })()
    // Disable exhaustive-deps because styles.nfcIcon was causing an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors.black, navigation, request?.state, request?.type])

  return null
}

export default Header

const useStyles = makeStyles(({ colors }) => ({
  nfcIcon: {
    marginTop: -1,
    marginRight: 14,
    padding: 8,
    display: "flex",
    flexDirection: "row",
    columnGap: 4,
    backgroundColor: colors.grey5,
    borderRadius: 4,
  },
}))
