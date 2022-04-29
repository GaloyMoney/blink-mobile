import { useMutation } from "@apollo/client"
import { useMySubscription } from "@app/hooks"
import useMainQuery from "@app/hooks/use-main-query"
import { translateUnknown as translate } from "@galoymoney/client"
import { debounce } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import { View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { ADD_NO_AMOUNT_INVOICE, ADD_USD_INVOICE } from "./gql"
import { QRView } from "./qr-view"

const styles = EStyleSheet.create({})
const ReceiveUsd = ({ navigation }) => {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [addNoAmountInvoice] = useMutation(ADD_NO_AMOUNT_INVOICE)
  const [addUsdInvoice] = useMutation(ADD_USD_INVOICE)
  const { usdWalletId } = useMainQuery()
  const [invoice, setInvoice] = useState<{
    paymentHash: string
    paymentRequest: string
  } | null>(null)
  const [usdAmount, setUsdAmount] = useState(0)
  const [memo, setMemo] = useState("")
  const { lnUpdate } = useMySubscription()
  const updateInvoice = useMemo(
    () =>
      debounce(
        async ({ walletId, usdAmount, memo }) => {
          setLoading(true)
          try {
            if (usdAmount === 0) {
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
              } = await addUsdInvoice({
                variables: {
                  input: { walletId, amount: usdAmount, memo },
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
    [addNoAmountInvoice, addUsdInvoice],
  )

  useEffect((): void | (() => void) => {
    if (usdWalletId) {
      updateInvoice({ walletId: usdWalletId, usdAmount, memo })
      return () => updateInvoice.cancel()
    }
  }, [usdAmount, memo, updateInvoice, usdWalletId])

  const invoicePaid =
    lnUpdate?.paymentHash === invoice?.paymentHash && lnUpdate?.status === "PAID"
  console.log(invoice)
  console.log(usdAmount)
  console.log(memo)
  console.log(loading)
  console.log(invoicePaid)

  return (
    <View>
      <QRView
        data={invoice?.paymentRequest}
        type="lightning"
        amount={usdAmount}
        memo={memo}
        loading={loading}
        completed={invoicePaid}
        navigation={navigation}
        err={err}
      />
    </View>
  )
}

export default ReceiveUsd
