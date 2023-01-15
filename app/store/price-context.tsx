import { loadJson, saveJson } from "@app/utils/storage"
import crashlytics from "@react-native-firebase/crashlytics"
import * as React from "react"
import { createContext, useContext, useEffect, useReducer } from "react"

import { usePriceSubscription } from "@app/graphql/generated"

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

export enum PriceReducerActionType {
  SET_PRICE = "set_price",
}

type PriceReducerAction = {
  type: PriceReducerActionType
  payload: {
    price: number
    priceDate: Date
  }
}

// The initial value will never be null because the provider will always pass a non null value
// eslint-disable-next-line
// @ts-ignore
const PriceContext = createContext<PriceContextType>(null)

const initialState: PriceData = {
  initialized: false,
}

const priceReducer = (state: PriceData, action: PriceReducerAction) => {
  switch (action.type) {
    case PriceReducerActionType.SET_PRICE:
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
    dispatch({
      type: PriceReducerActionType.SET_PRICE,
      payload: { price, priceDate: date },
    })
  }

  usePriceSubscription({
    variables: {
      input: {
        amount: 1,
        amountCurrencyUnit: "BTCSAT",
        priceCurrencyUnit: "USDCENT",
      },
    },
    onData: ({ data }) => {
      if (data.data?.price?.price?.formattedAmount) {
        // FIXME type. casting should not be necessary
        const n = Number(data.data.price.price.formattedAmount)
        setPrice(n)
      }
    },
    onError: (error) => console.error(error, "useSubscription PRICE_SUBSCRIPTION"),
    onComplete: () => console.info("onComplete useSubscription PRICE_SUBSCRIPTION"),
  })

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const cachedPriceData: PriceData = await loadJson(PRICE_REDUCER_STORAGE_KEY)
        if (cachedPriceData.initialized) {
          dispatch({
            type: PriceReducerActionType.SET_PRICE,
            payload: {
              price: cachedPriceData.price,
              priceDate: new Date(cachedPriceData.priceDate),
            },
          })
        }
      } catch (err) {
        crashlytics().recordError(err)
      }
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
