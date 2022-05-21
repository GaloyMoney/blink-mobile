import React, { useState } from "react"
import TransferConfirmationScreen from "./transfer-confirmation-screen"
import { TransferScreen } from "./transfer-screen"
import TransferSuccess from "./transfer-success"

const TransferFlow = () => {
    const [fromWallet, setFromWallet] = useState<Wallet>()
    const [toWallet, setToWallet] = useState<Wallet>()
    const [amountCurrency, setAmountCurrency] = useState("USD")
    const [dollarAmount, setDollarAmount] = useState(0)
    const [satAmount, setSatAmount] = useState(0)
    const [satAmountInUsd, setSatAmountInUsd] = useState(0)
    const [step, setStep] = useState(0)

    const nextStep = () => {
        setStep(step + 1)
    }

    return (<>
        {step === 0 && <TransferScreen
            fromWallet={fromWallet}
            setFromWallet={setFromWallet}
            toWallet={toWallet}
            setToWallet={setToWallet}
            amountCurrency={amountCurrency}
            setAmountCurrency={setAmountCurrency}
            dollarAmount={dollarAmount}
            setDollarAmount={setDollarAmount}
            satAmount={satAmount}
            setSatAmount={setSatAmount}
            satAmountInUsd={satAmountInUsd}
            setSatAmountInUsd={setSatAmountInUsd}
            nextStep={nextStep}
        />}
        {step === 1 && <TransferConfirmationScreen
            fromWallet={fromWallet}
            toWallet={toWallet}
            amountCurrency={amountCurrency}
            dollarAmount={dollarAmount}
            satAmount={satAmount}
            satAmountInUsd={satAmountInUsd}
            nextStep={nextStep}
        />}
        {step === 2 && <TransferSuccess />}
    </>)
}

export default TransferFlow