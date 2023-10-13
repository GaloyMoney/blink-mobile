import { Dispatch, SetStateAction, createContext, useState } from "react"

type Nfc = {
  displayReceiveNfc: boolean
  setDisplayReceiveNfc: Dispatch<SetStateAction<boolean>>
}

const defaultValue = {
  displayReceiveNfc: false,
  setDisplayReceiveNfc: () => null,
}

export const NfcContext = createContext<Nfc>(defaultValue)

export const NfcContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [displayReceiveNfc, setDisplayReceiveNfc] = useState(false)

  const value = {
    displayReceiveNfc,
    setDisplayReceiveNfc,
  }

  return <NfcContext.Provider value={value}>{children}</NfcContext.Provider>
}
