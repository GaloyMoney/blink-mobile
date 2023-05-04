import { PropsWithChildren } from "react"
import { useIsAuthed } from "./is-authed-context"
import { LevelContextProvider } from "./level-context"
import { gql } from "@apollo/client"
import {
  useLevelQuery,
  useNetworkQuery,
  useUserDeviceAccountCreateMutation,
} from "./generated"
import * as React from "react"
import { useAppConfig } from "@app/hooks"
import analytics from "@react-native-firebase/analytics"
import DeviceInfo from "react-native-device-info"
gql`
  query network {
    globals {
      network
    }
  }

  query level {
    me {
      id
      defaultAccount {
        id
        level
      }
    }
  }

  mutation userDeviceAccountCreate($input: UserDeviceAccountCreateInput!) {
    userDeviceAccountCreate(input: $input) {
      authToken
      errors {
        message
      }
    }
  }
`

export const LevelContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const isAuthed = useIsAuthed()
  const { saveToken } = useAppConfig()

  const isLevel0 = isAuthed

  const { data } = useLevelQuery({ fetchPolicy: "cache-only" })

  const level = data?.me?.defaultAccount?.level
  const isLevel1 = level === "ONE"

  const [userDeviceAccountCreate] = useUserDeviceAccountCreateMutation({
    fetchPolicy: "no-cache",
  })

  const { data: dataNetwork } = useNetworkQuery()
  const network = dataNetwork?.globals?.network

  const currentLevel = isAuthed && level ? level : "NonAuth"

  React.useEffect(() => {
    ;(async () => {
      // TODO: remove once feature is completed.
      // This is a temporary measure to prevent ddos our backend
      if (!network || network === "mainnet") {
        return
      }

      if (!userDeviceAccountCreate || !saveToken || isLevel0) {
        return
      }

      const uniqueId = await DeviceInfo.getUniqueId()

      // iOS: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
      // Android: "dd96dec43fb81c97"
      // Windows: "{2cf7cb3c-da7a-d508-0d7f-696bb51185b4}"
      console.log({ uniqueId })

      const { data } = await userDeviceAccountCreate({
        variables: {
          input: {
            deviceId: uniqueId,
          },
        },
      })

      const token = data?.userDeviceAccountCreate.authToken

      if (token) {
        analytics().logLogin({ method: "device" })
        saveToken(token)
      } else {
        console.error(
          data?.userDeviceAccountCreate.errors,
          "error creating userDeviceAccount",
        )
      }
    })()
  }, [userDeviceAccountCreate, saveToken, isLevel0, network])

  return (
    <LevelContextProvider value={{ isLevel0, isLevel1, currentLevel }}>
      {children}
    </LevelContextProvider>
  )
}
