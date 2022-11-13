import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface UserReducer {
  location: { lat: number; long: number }
}

const initialState = {
  location: { lat: 0, long: 0 },
} as UserReducer

const userSlice = createSlice({
  name: "userReducer",
  initialState,
  reducers: {
    setLocation(state, action: PayloadAction<{ lat: number; long: number }>) {
      state.location = { ...action.payload }
    },
  },
})

export const { setLocation } = userSlice.actions
export default userSlice.reducer
