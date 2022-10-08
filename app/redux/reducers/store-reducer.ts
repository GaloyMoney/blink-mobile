import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { MarketplaceTag } from "@app/constants/model"

export interface PostAttributes {
  _id: string
  address: string
  categoryId?: string
  createdAt: string
  description: string
  imagesUrls?: string[]
  location: {
    lat: number
    long: number
  }
  tags:MarketplaceTag[]|[]
  mainImageUrl: string
  name: string
  openHours?: string
  price?: number
  rating?: number
  updatedAt: string
  userId: string
  phone?: string
  email?: string
}
interface StoreReducer {
  value: number
  tempPost: PostAttributes
  postList: PostAttributes[]
}

const initialState = {
  value: 0,
  tempPost: null,
  postList: [],
} as StoreReducer

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setTempPost(state, action: PayloadAction<PostAttributes>) {
      state.tempPost = { ...state.tempPost, ...action.payload }
    },
    clearTempStore(state) {
      state.tempPost = null
    },
    setPostList(state, action: PayloadAction<PostAttributes[]>) {
      state.postList = action.payload
    },
  },
})

export const { setTempPost, clearTempStore, setPostList } = storeSlice.actions
export default storeSlice.reducer
