import functions from "@react-native-firebase/functions"

export const GetReward = async ({value, memo, lnd, setErr}) => {
  
  try {
    const response = await lnd.addInvoice({
      value,
      memo,
    })
    const invoice = response.paymentRequest
    const result = await functions().httpsCallable("payInvoice")({ invoice })
    console.tron.log(invoice, result)
  } catch (err) {
      console.tron.log(String(err) + String(err[2]))
      setErr(err.toString())
  }
}
