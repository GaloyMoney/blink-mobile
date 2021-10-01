import { useEffect, useRef, useState } from "react"
import { EventSubscription, NativeEventEmitter, NativeModules } from "react-native"
import {
  ApolloCache,
  DefaultContext,
  gql,
  MutationFunctionOptions,
  OperationVariables,
  useMutation,
} from "@apollo/client"
import GeetestModule from "react-native-geetest-module"

const REGISTER_CAPTCHA = gql`
  mutation captchaCreateChallenge {
    captchaCreateChallenge {
      errors {
        message
      }
      result {
        id
        challengeCode
        newCaptcha
        failbackMode
      }
    }
  }
`
type GeetestValidationData = {
  geetestChallenge: string
  geetestSecCode: string
  geetestValidate: string
}

type GeetestCaptchaReturn = {
  geetestValidationData: GeetestValidationData | null
  loadingRegisterCaptcha: boolean
  registerCaptcha: (
    options?: MutationFunctionOptions<
      unknown,
      OperationVariables,
      DefaultContext,
      ApolloCache<unknown>
    >,
  ) => Promise<unknown>
}

export const useGeetestCaptcha = (
  handleGeetestError: (error: string) => void,
): GeetestCaptchaReturn => {
  const [geetestValidationData, setGeetesValidationData] =
    useState<GeetestValidationData | null>(null)

  const onGeeTestDialogResultListener = useRef<EventSubscription>()
  const onGeeTestFailedListener = useRef<EventSubscription>()

  const [
    registerCaptcha,
    { loading: loadingRegisterCaptcha, data: registerCaptchaData },
  ] = useMutation(REGISTER_CAPTCHA, {
    fetchPolicy: "no-cache",
  })

  useEffect(() => {
    GeetestModule.setUp()

    const eventEmitter = new NativeEventEmitter(NativeModules.GeetestModule)

    onGeeTestDialogResultListener.current = eventEmitter.addListener(
      "GT3-->onDialogResult-->",
      (event) => {
        const parsedDialogResult = JSON.parse(event.result)
        setGeetesValidationData({
          geetestChallenge: parsedDialogResult.geetest_challenge,
          geetestSecCode: parsedDialogResult.geetest_seccode,
          geetestValidate: parsedDialogResult.geetest_validate,
        })
      },
    )

    onGeeTestFailedListener.current = eventEmitter.addListener(
      "GT3-->onFailed-->",
      (event) => {
        handleGeetestError(event.error)
      },
    )

    return () => {
      GeetestModule.tearDown()

      onGeeTestDialogResultListener.current.remove()
      onGeeTestFailedListener.current.remove()
    }
  }, [handleGeetestError])

  useEffect(() => {
    const result = registerCaptchaData?.captchaCreateChallenge?.result
    if (result) {
      const params = {
        success: !result.failbackMode,
        challenge: result.challengeCode,
        gt: result.id,
        new_captcha: result.newCaptcha,
      }
      GeetestModule.handleRegisteredGeeTestCaptcha(JSON.stringify(params))
    }
  }, [registerCaptchaData])

  return {
    geetestValidationData,
    loadingRegisterCaptcha,
    registerCaptcha,
  }
}
