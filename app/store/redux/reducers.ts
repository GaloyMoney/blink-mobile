import { combineReducers } from "@reduxjs/toolkit"

// slices
import userSlice from "./slices/userSlice"
import settingsSlice from "./slices/settingsSlice"

export default combineReducers({
  user: userSlice,
  settings: settingsSlice,
})
