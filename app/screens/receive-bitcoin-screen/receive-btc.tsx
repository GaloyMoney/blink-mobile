import { useMutation } from "@apollo/client"
import { useMySubscription } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { translate } from "@app/i18n"
import { debounce } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { ADD_INVOICE, ADD_NO_AMOUNT_INVOICE } from "./gql"
import { QRView } from "./qr-view"

const styles = EStyleSheet.create({})
const ReceiveBtc = ({ navigation }) => {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [addNoAmountInvoice] = useMutation(ADD_NO_AMOUNT_INVOICE)
  const [addInvoice] = useMutation(ADD_INVOICE)
  const { btcWalletId } = useMainQuery()
  const [invoice, setInvoice] = useState<{
    paymentHash: string
    paymentRequest: string
  } | null>(null)
  const [btcAmount, setBtcAmount] = useState(0)
  const [memo, setMemo] = useState("")
  const { lnUpdate } = useMySubscription()
  const updateInvoice = useMemo(
    () =>
      debounce(
        async ({ walletId, btcAmount, memo }) => {
          setLoading(true)
          try {
            if (btcAmount === 0) {
              const {
                data: {
                  lnNoAmountInvoiceCreate: { invoice, errors },
                },
              } = await addNoAmountInvoice({
                variables: { input: { walletId, memo } },
              })
              if (errors && errors.length !== 0) {
                console.error(errors, "error with lnNoAmountInvoiceCreate")
                setErr(translate("ReceiveBitcoinScreen.error"))
                return
              }
              setInvoice(invoice)
            } else {
              const {
                data: {
                  lnInvoiceCreate: { invoice, errors },
                },
              } = await addInvoice({
                variables: {
                  input: { walletId, amount: btcAmount, memo },
                },
              })
              if (errors && errors.length !== 0) {
                console.error(errors, "error with lnInvoiceCreate")
                setErr(translate("ReceiveBitcoinScreen.error"))
                return
              }
              setInvoice(invoice)
            }
          } catch (err) {
            console.error(err, "error with AddInvoice")
            setErr(`${err}`)
            throw err
          } finally {
            setLoading(false)
          }
        },
        1000,
        { trailing: true },
      ),
    [addNoAmountInvoice, addInvoice],
  )

  useEffect((): void | (() => void) => {
    if (btcWalletId) {
      updateInvoice({ walletId: btcWalletId, btcAmount, memo })
      return () => updateInvoice.cancel()
    }
  }, [btcAmount, memo, updateInvoice, btcWalletId])

  const invoicePaid =
    lnUpdate?.paymentHash === invoice?.paymentHash && lnUpdate?.status === "PAID"

  return (
    <View>
      <QRView
        data={invoice?.paymentRequest}
        type="lightning"
        amount={btcAmount}
        memo={memo}
        loading={loading}
        completed={invoicePaid}
        navigation={navigation}
        err={err}
      />
    </View>
  )
}

export default ReceiveBtc
