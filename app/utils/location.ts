import axios from "axios"
import { loadString, saveString } from "./storage"
import { CountryCode } from "libphonenumber-js/mobile"

export async function getCountryFromIpAddress(): Promise<CountryCode> {
  let countryCode = "SV" as CountryCode

  try {
    const response = await axios.get("https://ipapi.co/json/", {
      timeout: 5000,
    })
    const _countryCode = response?.data?.country_code
    if (_countryCode) {
      await saveString("country_code", countryCode)
    } else {
      console.warn("no data or country_code in response")
    }
    // can throw a 429 for device's rate-limiting. resort to cached value if available
  } catch (e) {
    const _countryCode = await loadString("country_code")
    if (_countryCode) {
      countryCode = _countryCode as CountryCode
    }
  }
  return countryCode
}
