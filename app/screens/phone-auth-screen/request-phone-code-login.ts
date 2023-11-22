import { useAppConfig, useGeetestCaptcha } from "@app/hooks"
import { useEffect, useMemo, useState } from "react"
import parsePhoneNumber, {
  AsYouType,
  CountryCode,
  getCountryCallingCode,
} from "libphonenumber-js/mobile"
import { logRequestAuthCode } from "@app/utils/analytics"
import { gql } from "@apollo/client"
import {
  PhoneCodeChannelType,
  useCaptchaRequestAuthCodeMutation,
  useSupportedCountriesQuery,
} from "@app/graphql/generated"

export const RequestPhoneCodeStatus = {
  LoadingCountryCode: "LoadingCountryCode",
  InputtingPhoneNumber: "InputtingPhoneNumber",
  CompletingCaptchaOrAppcheck: "CompletingCaptchaOrAppcheck",
  RequestingCode: "RequestingCode",
  SuccessRequestingCode: "SuccessRequestingCode",
  Error: "Error",
} as const

export const ErrorType = {
  InvalidPhoneNumberError: "InvalidPhoneNumberError",
  FailedCaptchaError: "FailedCaptchaError",
  TooManyAttemptsError: "TooManyAttemptsError",
  RequestCodeError: "RequestCodeError",
  UnsupportedCountryError: "UnsupportedCountryError",
} as const

import axios, { isAxiosError } from "axios"
import { getAppCheckToken } from "../get-started-screen/use-device-token"

type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

export type RequestPhoneCodeStatus =
  (typeof RequestPhoneCodeStatus)[keyof typeof RequestPhoneCodeStatus]

type PhoneInputInfo = {
  countryCode: CountryCode
  countryCallingCode: string
  formattedPhoneNumber: string
  rawPhoneNumber: string
}

export type UseRequestPhoneCodeReturn = {
  userSubmitPhoneNumber: (phoneCodeChannel: PhoneCodeChannelType) => void
  setStatus: (status: RequestPhoneCodeStatus) => void
  status: RequestPhoneCodeStatus
  phoneInputInfo?: PhoneInputInfo
  validatedPhoneNumber?: string
  isWhatsAppSupported: boolean
  isSmsSupported: boolean
  phoneCodeChannel: PhoneCodeChannelType
  error?: ErrorType
  captchaLoading: boolean
  setCountryCode: (countryCode: CountryCode) => void
  setPhoneNumber: (number: string) => void
  supportedCountries: CountryCode[]
  loadingSupportedCountries: boolean
}

export const PhoneCodeChannelToFriendlyName = {
  [PhoneCodeChannelType.Sms]: "SMS",
  [PhoneCodeChannelType.Whatsapp]: "WhatsApp",
}

gql`
  mutation captchaRequestAuthCode($input: CaptchaRequestAuthCodeInput!) {
    captchaRequestAuthCode(input: $input) {
      errors {
        message
        code
      }
      success
    }
  }

  query supportedCountries {
    globals {
      supportedCountries {
        id
        supportedAuthChannels
      }
    }
  }
`

export const useRequestPhoneCodeLogin = (): UseRequestPhoneCodeReturn => {
  const [status, setStatus] = useState<RequestPhoneCodeStatus>(
    RequestPhoneCodeStatus.LoadingCountryCode,
  )
  const [countryCode, setCountryCode] = useState<CountryCode | undefined>()
  const [rawPhoneNumber, setRawPhoneNumber] = useState<string>("")
  const [validatedPhoneNumber, setValidatedPhoneNumber] = useState<string | undefined>()
  const [phoneCodeChannel, setPhoneCodeChannel] = useState<PhoneCodeChannelType>(
    PhoneCodeChannelType.Sms,
  )

  const {
    appConfig: {
      galoyInstance: { authUrl },
    },
  } = useAppConfig()

  const { appConfig } = useAppConfig()

  const [error, setError] = useState<ErrorType | undefined>()
  const [captchaRequestAuthCode] = useCaptchaRequestAuthCodeMutation()

  const { data, loading: loadingSupportedCountries } = useSupportedCountriesQuery()

  const [appCheckToken, setAppCheckToken] = useState<string | undefined>()

  const {
    geetestError,
    geetestValidationData,
    loadingRegisterCaptcha,
    registerCaptcha,
    resetError,
    resetValidationData,
  } = useGeetestCaptcha()

  const { isWhatsAppSupported, isSmsSupported, allSupportedCountries } = useMemo(() => {
    const currentCountry = data?.globals?.supportedCountries.find(
      (country) => country.id === countryCode,
    )

    const allSupportedCountries = (data?.globals?.supportedCountries.map(
      (country) => country.id,
    ) || []) as CountryCode[]

    const isWhatsAppSupported =
      currentCountry?.supportedAuthChannels.includes(PhoneCodeChannelType.Whatsapp) ||
      false
    const isSmsSupported =
      currentCountry?.supportedAuthChannels.includes(PhoneCodeChannelType.Sms) || false

    return {
      isWhatsAppSupported,
      isSmsSupported,
      allSupportedCountries,
    }
  }, [data?.globals, countryCode])

  // setting default country code from IP
  useEffect(() => {
    const getCountryCodeFromIP = async () => {
      let defaultCountryCode = "SV" as CountryCode
      try {
        const response = await axios.get("https://ipapi.co/json/", {
          timeout: 5000,
        })
        const data = response.data

        if (data && data.country_code) {
          const countryCode = data.country_code
          defaultCountryCode = countryCode
        } else {
          console.warn("no data or country_code in response")
        }
      } catch (error) {
        console.error(error)
      }

      setCountryCode(defaultCountryCode)
      setStatus(RequestPhoneCodeStatus.InputtingPhoneNumber)
    }

    getCountryCodeFromIP()
  }, [])

  // requesting appcheck token
  useEffect(() => {
    ;(async () => {
      setAppCheckToken(await getAppCheckToken())
    })()
  }, [])

  // when phone number is submitted and either captcha is requested, or appcheck is used
  useEffect(() => {
    if (status !== RequestPhoneCodeStatus.CompletingCaptchaOrAppcheck) {
      return
    }

    const captchaPath = async () => {
      if (geetestError) {
        setStatus(RequestPhoneCodeStatus.Error)
        setError(ErrorType.FailedCaptchaError)
        resetError()
        return
      }

      if (geetestValidationData && validatedPhoneNumber) {
        setStatus(RequestPhoneCodeStatus.RequestingCode)
        const input = {
          phone: validatedPhoneNumber,
          challengeCode: geetestValidationData.geetestChallenge,
          validationCode: geetestValidationData.geetestValidate,
          secCode: geetestValidationData.geetestSecCode,
          channel: phoneCodeChannel,
        } as const
        resetValidationData()
        logRequestAuthCode({
          instance: appConfig.galoyInstance.id,
          channel: phoneCodeChannel,
        })

        try {
          const { data } = await captchaRequestAuthCode({ variables: { input } })

          if (data?.captchaRequestAuthCode.success) {
            setStatus(RequestPhoneCodeStatus.SuccessRequestingCode)
            return
          }

          setStatus(RequestPhoneCodeStatus.Error)
          const errors = data?.captchaRequestAuthCode.errors

          if (errors && errors.some((error) => error.code === "TOO_MANY_REQUEST")) {
            console.log("Too many attempts")
            setError(ErrorType.TooManyAttemptsError)
          } else {
            setError(ErrorType.RequestCodeError)
          }
        } catch (err) {
          setStatus(RequestPhoneCodeStatus.Error)
          setError(ErrorType.RequestCodeError)
        }
      } else {
        // we first register captcha, which will set geetestValidationData
        registerCaptcha()
      }
    }

    const appCheckPath = async () => {
      try {
        await axios.post(
          authUrl + "/auth/phone/code-appcheck",
          {
            phone: validatedPhoneNumber,
            channel: phoneCodeChannel,
          },
          {
            headers: {
              Appcheck: appCheckToken,
            },
          },
        )

        setStatus(RequestPhoneCodeStatus.SuccessRequestingCode)
      } catch (err) {
        setStatus(RequestPhoneCodeStatus.Error)
        if (
          isAxiosError(err) &&
          err.response?.data.error === "UserCodeAttemptIdentifierRateLimiterExceededError"
        ) {
          setError(ErrorType.TooManyAttemptsError)
        } else {
          setError(ErrorType.RequestCodeError)
        }
      }
    }

    const skipRequestPhoneCode =
      appConfig.galoyInstance.name === "Local" ||
      appConfig.galoyInstance.name === "Staging"

    if (skipRequestPhoneCode) {
      setStatus(RequestPhoneCodeStatus.SuccessRequestingCode)
    } else if (appCheckToken) {
      appCheckPath()
    } else {
      captchaPath()
    }
  }, [
    status,
    geetestValidationData,
    validatedPhoneNumber,
    appConfig,
    captchaRequestAuthCode,
    geetestError,
    phoneCodeChannel,
    resetError,
    resetValidationData,
    registerCaptcha,
    appCheckToken,
    authUrl,
  ])

  const setPhoneNumber = (number: string) => {
    if (status === RequestPhoneCodeStatus.RequestingCode) {
      return
    }

    const parsedPhoneNumber = parsePhoneNumber(number, countryCode)
    if (parsedPhoneNumber?.country) {
      setCountryCode(parsedPhoneNumber.country)
    }

    setRawPhoneNumber(number)
    setError(undefined)
    setStatus(RequestPhoneCodeStatus.InputtingPhoneNumber)
  }

  const userSubmitPhoneNumber = (phoneCodeChannel: PhoneCodeChannelType) => {
    if (
      status === RequestPhoneCodeStatus.LoadingCountryCode ||
      status === RequestPhoneCodeStatus.RequestingCode
    ) {
      return
    }

    const parsedPhoneNumber = parsePhoneNumber(rawPhoneNumber, countryCode)
    phoneCodeChannel && setPhoneCodeChannel(phoneCodeChannel)
    if (parsedPhoneNumber?.isValid()) {
      if (
        !parsedPhoneNumber.country ||
        (phoneCodeChannel === PhoneCodeChannelType.Sms && !isSmsSupported) ||
        (phoneCodeChannel === PhoneCodeChannelType.Whatsapp && !isWhatsAppSupported)
      ) {
        setStatus(RequestPhoneCodeStatus.Error)
        setError(ErrorType.UnsupportedCountryError)
        return
      }

      setValidatedPhoneNumber(parsedPhoneNumber.number)

      setStatus(RequestPhoneCodeStatus.CompletingCaptchaOrAppcheck)
    } else {
      setStatus(RequestPhoneCodeStatus.Error)
      setError(ErrorType.InvalidPhoneNumberError)
    }
  }

  let phoneInputInfo: PhoneInputInfo | undefined = undefined
  if (countryCode) {
    phoneInputInfo = {
      countryCode,
      formattedPhoneNumber: new AsYouType(countryCode).input(rawPhoneNumber),
      countryCallingCode: getCountryCallingCode(countryCode),
      rawPhoneNumber,
    }
  }

  return {
    status,
    setStatus,
    phoneInputInfo,
    validatedPhoneNumber,
    error,
    userSubmitPhoneNumber,
    phoneCodeChannel,
    isWhatsAppSupported,
    isSmsSupported,
    captchaLoading: loadingRegisterCaptcha,
    setCountryCode,
    setPhoneNumber,
    supportedCountries: allSupportedCountries,
    loadingSupportedCountries,
  }
}
