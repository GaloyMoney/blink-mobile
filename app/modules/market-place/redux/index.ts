import { configureStore } from "@reduxjs/toolkit"
import { rootReducer } from "./reducers"
// import { createLogger } from "redux-logger"
const middleWares = [
  // createLogger({})
]
const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    // TODO: Both should be true
    getDefaultMiddleware().concat(middleWares),
})

export type RootState = ReturnType<typeof store.getState>
export default store
