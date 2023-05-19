import { useAppConfig, useGeetestCaptcha } from "@app/hooks"
import { useEffect, useState } from "react"
import parsePhoneNumber, {
  AsYouType,
  CountryCode,
  getCountryCallingCode,
} from "libphonenumber-js/mobile"
import { logRequestAuthCode } from "@app/utils/analytics"
import { Key as KeyType } from "@app/components/amount-input-screen/number-pad-reducer"
import { gql } from "@apollo/client"
import { useCaptchaRequestAuthCodeMutation } from "@app/graphql/generated"

export const RequestPhoneCodeStatus = {
  LoadingCountryCode: "LoadingCountryCode",
  InputtingPhoneNumber: "InputtingPhoneNumber",
  CompletingCaptcha: "CompletingCaptcha",
  RequestingCode: "RequestingCode",
  SuccessRequestingCode: "SuccessRequestingCode",
  Error: "Error",
} as const

export const ErrorType = {
  InvalidPhoneNumberError: "InvalidPhoneNumberError",
  FailedCaptchaError: "FailedCaptchaError",
  TooManyAttemptsError: "TooManyAttemptsError",
  RequestCodeError: "RequestCodeError",
} as const

type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

export type RequestPhoneCodeStatus =
  (typeof RequestPhoneCodeStatus)[keyof typeof RequestPhoneCodeStatus]

type PhoneInputInfo = {
  countryCode: CountryCode
  countryCallingCode: string
  formattedPhoneNumber: string
}

export const MessagingChannel = {
  Sms: "SMS",
  Whatsapp: "WHATSAPP",
} as const

export type MessagingChannel = (typeof MessagingChannel)[keyof typeof MessagingChannel]

export type UseRequestPhoneCodeProps = {
  skipRequestPhoneCode?: boolean
}

export type UseRequestPhoneCodeReturn = {
  receivePhoneKey: (key: PhoneKey) => void
  submitPhoneNumber: (messagingChannel?: MessagingChannel) => void
  setStatus: (status: RequestPhoneCodeStatus) => void
  status: RequestPhoneCodeStatus
  phoneInputInfo?: PhoneInputInfo
  validatedPhoneNumber?: string
  messagingChannel: MessagingChannel
  error?: ErrorType
  captchaLoading: boolean
  setCountryCode: (countryCode: CountryCode) => void
}

type PhoneKey = KeyType

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
`

export const useRequestPhoneCode = ({
  skipRequestPhoneCode,
}: UseRequestPhoneCodeProps): UseRequestPhoneCodeReturn => {
  const [status, setStatus] = useState<RequestPhoneCodeStatus>(
    RequestPhoneCodeStatus.LoadingCountryCode,
  )
  const [countryCode, setCountryCode] = useState<CountryCode | undefined>()
  const [rawPhoneNumber, setRawPhoneNumber] = useState<string>("")
  const [validatedPhoneNumber, setValidatedPhoneNumber] = useState<string | undefined>()
  const [messagingChannel, setMessagingChannel] = useState<MessagingChannel>("SMS")
  const { appConfig } = useAppConfig()

  const [error, setError] = useState<ErrorType | undefined>()
  const [captchaRequestAuthCode] = useCaptchaRequestAuthCodeMutation({
    fetchPolicy: "no-cache",
  })

  const {
    geetestError,
    geetestValidationData,
    loadingRegisterCaptcha,
    registerCaptcha,
    resetError,
    resetValidationData,
  } = useGeetestCaptcha()

  useEffect(() => {
    const getCountryCodeFromIP = async () => {
      let defaultCountryCode = "SV" as CountryCode
      try {
        const response = (await fetchWithTimeout("https://ipapi.co/json/")) as Response
        const data = await response.json()

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

  const receivePhoneKey = (key: PhoneKey) => {
    if (status === RequestPhoneCodeStatus.RequestingCode) {
      return
    }

    if (key === KeyType.Decimal) {
      return
    }

    if (key === KeyType.Backspace) {
      setRawPhoneNumber(rawPhoneNumber.slice(0, -1))
    } else {
      setRawPhoneNumber(rawPhoneNumber + key)
    }
    setError(undefined)
    setStatus(RequestPhoneCodeStatus.InputtingPhoneNumber)
  }

  const submitPhoneNumber = (messagingChannel?: MessagingChannel) => {
    if (
      status === RequestPhoneCodeStatus.LoadingCountryCode ||
      status === RequestPhoneCodeStatus.RequestingCode
    ) {
      return
    }

    const parsedPhoneNumber = parsePhoneNumber(rawPhoneNumber, countryCode)
    messagingChannel && setMessagingChannel(messagingChannel)
    if (parsedPhoneNumber?.isValid()) {
      setValidatedPhoneNumber(parsedPhoneNumber.number)

      if (skipRequestPhoneCode) {
        setStatus(RequestPhoneCodeStatus.SuccessRequestingCode)
        return
      }

      setStatus(RequestPhoneCodeStatus.CompletingCaptcha)
      registerCaptcha()
    } else {
      setStatus(RequestPhoneCodeStatus.Error)
      setError(ErrorType.InvalidPhoneNumberError)
    }
  }

  useEffect(() => {
    if (status !== RequestPhoneCodeStatus.CompletingCaptcha) {
      return
    }

    ;(async () => {
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
          channel: messagingChannel,
        } as const
        resetValidationData()
        logRequestAuthCode(appConfig.galoyInstance.id)

        try {
          const { data } = await captchaRequestAuthCode({ variables: { input } })

          if (data?.captchaRequestAuthCode.success) {
            setStatus(RequestPhoneCodeStatus.SuccessRequestingCode)
            return
          }

          setStatus(RequestPhoneCodeStatus.Error)
          const errors = data?.captchaRequestAuthCode.errors
          console.log("errors", errors)
          if (errors && errors.some((error) => error.code === "TOO_MANY_REQUEST")) {
            console.log("Too many attempts")
            setError(ErrorType.TooManyAttemptsError)
          } else {
            setError(ErrorType.RequestCodeError)
          }
        } catch (err) {
          console.log("Captch error", err)
          setStatus(RequestPhoneCodeStatus.Error)
          setError(ErrorType.RequestCodeError)
        }
      }
    })()
  }, [
    status,
    geetestValidationData,
    validatedPhoneNumber,
    appConfig,
    captchaRequestAuthCode,
    geetestError,
    messagingChannel,
    resetError,
    resetValidationData,
  ])

  let phoneInputInfo: PhoneInputInfo | undefined = undefined
  if (countryCode) {
    phoneInputInfo = {
      countryCode,
      formattedPhoneNumber: new AsYouType(countryCode).input(rawPhoneNumber),
      countryCallingCode: getCountryCallingCode(countryCode),
    }
  }

  return {
    status,
    setStatus,
    phoneInputInfo,
    validatedPhoneNumber,
    error,
    receivePhoneKey,
    submitPhoneNumber,
    messagingChannel,
    captchaLoading: loadingRegisterCaptcha,
    setCountryCode,
  }
}

const fetchWithTimeout = (url: string, timeout = 5000) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("request timed out")), timeout)
    }),
  ])
}
