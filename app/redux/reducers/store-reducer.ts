import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

const FAKE_DATA = [
  {
    name: 'Avenida 24 bar',
    location: {
      lat: 9.922547,
      long: -84.075127,
    },
    distance: 200,
    rating: 4,
    description: 'Burgers - Italian - Hot vine - Grilled - Canadian',
    reviewNumber: 54,
  },
  {
    name: 'Dónde Glori',
    location: {
      lat: 9.923100,
      long: -84.074872,
    },
    distance: 321,
    rating: 4.5,
    description: 'Burgers - Italian - Hot vine - Grilled - Canadian',
    reviewNumber: 54,
  },
  {
    name: 'Mariscos Bar',
    location: {
      lat: 9.922835,
      long: -84.075830,
    },
    distance: 222,
    rating: 5,
    description: 'Burgers - Italian - Hot vine - Grilled - Canadian',
    reviewNumber: 54,
  },
  {
    name: `Miriam's Cupcakes`,
    location: {
      lat: 9.924091,
      long: -84.072507,
    },
    distance: 155,
    rating: 5,
    description: 'Burgers - Italian - Hot vine - Grilled - Canadian',
    reviewNumber: 54,
  },
]

export interface StoreAttributes {
  name?: string
  description?: string
  category?: string
  images?: string[]
  thumbnail?: string
  location?: { lat: any; long: any }
  reviewNumber?: number
  distance?: number
  rating?: number
  price?:number
}
interface StoreReducer {
  value: number
  tempStore: StoreAttributes
  storeList: StoreAttributes[]
}

const initialState = {
  value: 0,
  tempStore: null,
  storeList: FAKE_DATA
} as StoreReducer

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setTempStore(state, action: PayloadAction<StoreAttributes>) {
      state.tempStore = { ...state.tempStore, ...action.payload }
    },
    clearTempStore(state) {
      state.tempStore = null
    },
  },
})

export const { setTempStore, clearTempStore } = storeSlice.actions
export default storeSlice.reducer
