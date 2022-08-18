import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

const FAKE_DATA = [
  {
    name: "Avenida 24 bar",
    location: {
      lat: 9.922547,
      long: -84.075127,
    },
    distance: 200,
    rating: 4,
    description: "Burgers - Italian - Hot vine - Grilled - Canadian",
    reviewNumber: 54,
  },
  {
    name: "Dónde Glori",
    location: {
      lat: 9.9231,
      long: -84.074872,
    },
    distance: 321,
    rating: 4.5,
    description: "Burgers - Italian - Hot vine - Grilled - Canadian",
    reviewNumber: 54,
  },
  {
    name: "Mariscos Bar",
    location: {
      lat: 9.922835,
      long: -84.07583,
    },
    distance: 222,
    rating: 5,
    description: "Burgers - Italian - Hot vine - Grilled - Canadian",
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
    description: "Burgers - Italian - Hot vine - Grilled - Canadian",
    reviewNumber: 54,
  },
]

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
