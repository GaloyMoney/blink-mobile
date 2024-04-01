import { createSlice } from "@reduxjs/toolkit"
import { AppThunk } from ".."
import { loadJson } from "@app/utils/storage"

interface SettingsSlice {
  btcWalletEnabled: boolean
  loading: boolean
  error: string
}

const initialState: SettingsSlice = {
  btcWalletEnabled: false,
  loading: false,
  error: "",
}

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    setLoading: (state, action) => ({
      ...state,
      loading: action.payload,
    }),
    setError: (state, action) => ({
      ...state,
      error: action.payload,
    }),
    resetSettingsSlice: () => ({
      ...initialState,
    }),
  },
})

export const { updateSettings, setLoading, setError, resetSettingsSlice } =
  settingsSlice.actions
export default settingsSlice.reducer

export const getSettingsData = (): AppThunk => async (dispatch, getState) => {
  const res = await loadJson("btcWalletEnabled")
  dispatch(updateSettings({ btcWalletEnabled: res }))
}
