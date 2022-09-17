import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export interface PostAttributes {
  _id: string
  address: string
  categoryId: string
  createdAt: string
  description: string
  imagesUrls?: string[]
  location: {
    lat: number
    long: number
  }
  mainImageUrl: string
  name: string
  openHours?: string
  price: number
  rating?: number
  updatedAt: string
  userId: string
  phone?: string
  email?: string
}
interface StoreReducer {
  value: number
  tempStore: PostAttributes
  postList: PostAttributes[]
}

const initialState = {
  value: 0,
  tempStore: null,
  postList: [],
} as StoreReducer

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setTempStore(state, action: PayloadAction<PostAttributes>) {
      state.tempStore = { ...state.tempStore, ...action.payload }
    },
    clearTempStore(state) {
      state.tempStore = null
    },
    setPostList(state, action: PayloadAction<PostAttributes[]>) {
      state.postList = action.payload
    },
  },
})

export const { setTempStore, clearTempStore, setPostList } = storeSlice.actions
export default storeSlice.reducer
