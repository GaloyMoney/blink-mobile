import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { MarketplaceTag, PostStatues } from "../../models"

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
    // add this coordinates follow backend
    coordinates?: [number, number]
  }
  tags: MarketplaceTag[]
  mainImageUrl: string
  name: string
  openHours?: string
  price?: number
  rating?: number
  updatedAt: string
  userId: string
  phone?: string
  email?: string
  owner?: {
    phoneNumber: string
    hidePhoneNumber: boolean
  }
  status?: PostStatues
  slug:string
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
