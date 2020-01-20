import * as React from "react"
import { useState, useEffect } from "react"
import functions from "@react-native-firebase/functions"
import { Loader } from "../../components/loader"
import { Alert } from "react-native"

export const GetReward = ({value, memo, next, lnd, loading}) => {

    const [err, setErr] = useState("")
    const [loader, showLoader] = useState(false)
  
    useEffect(() => {
      if (!loading) {
        return
      }
  
      const _ = async () => {
        try {
          const response = await lnd.addInvoice({
            value,
            memo,
          })
          const invoice = response.paymentRequest
          const result = await functions().httpsCallable("payInvoice")({ invoice })
          console.tron.log(invoice, result)
          showLoader(false)
          next()
        } catch (err) {
          console.tron.debug(String(err) + String(err[2]))
          setErr(err.toString())
        }
      }
  
      _()
    }, [loading])
  
    useEffect(() => {
      if (err !== "") {
        Alert.alert("error", err, [
          {
            text: "OK",
            onPress: () => {
              showLoader(false)
            },
          },
        ])
        setErr("")
      }
    }, [err])
  
    useEffect(() => {
      showLoader(loading)
    }, [loading])
  
    return (
      <Loader loading={loader} />
    )
  }