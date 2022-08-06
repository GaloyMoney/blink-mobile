import { saveJson, loadJson } from "@app/utils/storage"
import { createContext, useContext, useEffect, useReducer } from "react"
import * as React from "react"
import { usePriceSubscription } from "@app/hooks/use-price-subscription"

export type PriceData =
  | {
      initialized: false
    }
  | {
      price: number
      priceDate: Date
      initialized: true
    }

type PriceContextType = {
  priceData: PriceData
  setPrice: (price: number, priceDate?: Date) => void
}

type PriceReducerAction = {
  type: "set_price"
  payload: {
    price: number
    priceDate: Date | undefined
  }
}
const PriceContext = createContext<PriceContextType>(undefined)

const initialState: PriceData = {
  initialized: false,
}

const priceReducer = (state: PriceData, action: PriceReducerAction) => {
  switch (action.type) {
    case "set_price":
      if (!state.initialized || action.payload.priceDate > state.priceDate) {
        return {
          price: action.payload.price,
          priceDate: action.payload.priceDate,
          initialized: true,
        }
      }
      return state
    default:
      return state
  }
}

const PRICE_REDUCER_STORAGE_KEY = "priceReducer"

export const PriceContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(priceReducer, initialState)

  const setPrice = (price: number, priceDate?: Date) => {
    const date = priceDate ? priceDate : new Date()
    dispatch({ type: "set_price", payload: { price, priceDate: date } })
  }

  usePriceSubscription(setPrice)

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const cachedPriceData: PriceData = await loadJson(PRICE_REDUCER_STORAGE_KEY)
        if (cachedPriceData.initialized) {
          dispatch({
            type: "set_price",
            payload: {
              price: cachedPriceData.price,
              priceDate: new Date(cachedPriceData.priceDate),
            },
          })
        }
      } catch {}
    }
    loadPrice()
  }, [])

  useEffect(() => {
    const savePrice = async () => {
      await saveJson(PRICE_REDUCER_STORAGE_KEY, state)
    }
    if (state.initialized) {
      savePrice()
    }
  }, [state])

  return (
    <PriceContext.Provider value={{ priceData: state, setPrice }}>
      {children}
    </PriceContext.Provider>
  )
}

export const usePriceContext = () => useContext(PriceContext).priceData
export const useSetPrice = () => useContext(PriceContext).setPrice
