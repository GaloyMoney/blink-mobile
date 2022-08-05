import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
interface StoreAttributes {
  name?: string
  description?: string
  category?: string
  images?: string[]
  thumbnail?: string
  location?: { lat: any; long: any }
}
interface StoreReducer {
  value: number
  tempStore: StoreAttributes
}

const initialState = {
  value: 0,
  tempStore: null,
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
