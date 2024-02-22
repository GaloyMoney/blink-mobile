import { createSlice } from "@reduxjs/toolkit"

interface UserSlice {
  userData: any
  loading: boolean
  error: string
}

const initialState: UserSlice = {
  userData: null,
  loading: false,
  error: "",
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => ({
      ...state,
      userData: action.payload,
    }),
    updateUserData: (state, action) => ({
      ...state,
      userData: {
        ...state.userData,
        ...action.payload,
      },
    }),
    setLoading: (state, action) => ({
      ...state,
      loading: action.payload,
    }),
    setError: (state, action) => ({
      ...state,
      error: action.payload,
    }),
    resetUserSlice: () => ({
      ...initialState,
    }),
  },
})

export const { setUserData, updateUserData, setLoading, setError, resetUserSlice } =
  userSlice.actions
export default userSlice.reducer
