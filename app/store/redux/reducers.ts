import { combineReducers } from "@reduxjs/toolkit"

// slices
import userSlice from "./slices/userSlice"

export default combineReducers({
  user: userSlice,
})
