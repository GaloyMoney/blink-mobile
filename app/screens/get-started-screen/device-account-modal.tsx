import CustomModal from "@app/components/custom-modal/custom-modal"
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { Platform, TouchableOpacity, View } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import { DeviceAccountFailModal } from "./device-account-fail-modal"
import { useEffect } from "react"
import {
  logAttemptCreateDeviceAccount,
  logCreateDeviceAccountFailure,
  logCreatedDeviceAccount,
} from "@app/utils/analytics"
import * as Keychain from "react-native-keychain"
import analytics from "@react-native-firebase/analytics"
import { v4 as uuidv4 } from "uuid"
import { generateSecureRandom } from "react-native-securerandom"
import crashlytics from "@react-native-firebase/crashlytics"

const generateSecureRandomUUID = async () => {
  const randomBytes = await generateSecureRandom(16) // Generate 16 random bytes
  const uuid = uuidv4({ random: randomBytes }) // Use the random seed to generate a UUID
  return uuid
}

const DEVICE_ACCOUNT_CREDENTIALS_KEY = "device-account"

export type DeviceAccountModalProps = {
  isVisible: boolean
  closeModal: () => void
  appCheckToken: string | undefined
}

export const DeviceAccountModal: React.FC<DeviceAccountModalProps> = ({
  isVisible,
  closeModal,
  appCheckToken,
}) => {
  const { saveToken } = useAppConfig()
  const {
    appConfig: {
      galoyInstance: { authUrl },
    },
  } = useAppConfig()

  const [hasError, setHasError] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [isBasicSelected, setIsBasicSelected] = React.useState<boolean | null>(null)
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const createDeviceAccountAndLogin = async () => {
    try {
      setLoading(true)
      const credentials = await Keychain.getInternetCredentials(
        DEVICE_ACCOUNT_CREDENTIALS_KEY,
      )

      let username: string
      let password: string

      if (credentials) {
        username = credentials.username
        password = credentials.password
      } else {
        username = await generateSecureRandomUUID()
        password = await generateSecureRandomUUID()
        const setPasswordResult = await Keychain.setInternetCredentials(
          DEVICE_ACCOUNT_CREDENTIALS_KEY,
          username,
          password,
        )
        if (!setPasswordResult) {
          throw new Error("Error setting device account credentials")
        }
      }

      logAttemptCreateDeviceAccount()

      const auth = Buffer.from(`${username}:${password}`, "utf8").toString("base64")

      const res = await fetch(authUrl + "/auth/create/device-account", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          Appcheck: `${appCheckToken}` || "undefined",
        },
      })
      if (!res.ok) {
        console.error(`Error fetching from server: ${res.status} ${res.statusText}`)
        return // Or handle this error appropriately
      }

      const data: {
        result: string | undefined
      } = await res.json()

      const authToken = data.result

      if (!authToken) {
        throw new Error("Error getting session token")
      }

      logCreatedDeviceAccount()
      analytics().logLogin({ method: "device" })
      saveToken(authToken)
      navigation.replace("Primary")
      closeModal()
    } catch (error) {
      setHasError(true)
      logCreateDeviceAccountFailure()
      if (error instanceof Error) {
        crashlytics().recordError(error)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!isVisible) {
      setHasError(false)
    }
  }, [isVisible])

  const navigateToPhoneLogin = () => {
    navigation.navigate("phoneFlow")
    closeModal()
  }

  const navigateToHomeScreen = () => {
    navigation.navigate("Primary")
    closeModal()
  }

  const onPressBasic = () => {
    createDeviceAccountAndLogin()
  }

  const onPressFull = () => {
    navigateToPhoneLogin()
  }

  return hasError ? (
    <DeviceAccountFailModal
      isVisible={isVisible}
      closeModal={closeModal}
      navigateToPhoneLogin={navigateToPhoneLogin}
      navigateToHomeScreen={navigateToHomeScreen}
    />
  ) : (
    <CustomModal
      isVisible={isVisible}
      toggleModal={closeModal}
      image={<GaloyIcon name="info" color={colors.primary3} size={100} />}
      title={LL.GetStartedScreen.chooseAccountType()}
      body={
        <View style={styles.modalBody}>
          <View style={styles.columnContainer}>
            <View style={styles.cellContainer}>
              <AccountTypeButton
                onPress={onPressBasic}
                selected={isBasicSelected === true}
                title={"BASIC⚡"}
              />
              <LimitItem text={"No Phone# required"} />
              <LimitItem text={"Receive in seconds"} />
            </View>
            <View style={styles.cellContainer}>
              <AccountTypeButton
                onPress={onPressFull}
                selected={isBasicSelected === false}
                title={"FULL✅"}
              />
              <LimitItem text={"No sending limits"} />
              <LimitItem text={"Safe wallet backup"} />
            </View>
          </View>
        </View>
      }
    />
  )
}

const LimitItem = ({ text }: { text: LocalizedString }) => {
  const styles = useStyles()

  return (
    <View style={styles.limitRow}>
      <Text type="p2" style={styles.limitText}>
        {text}
      </Text>
    </View>
  )
}

const AccountTypeButton = ({
  title,
  onPress,
  selected,
}: {
  title: string
  onPress: () => void
  selected: boolean
}) => {
  const styles = useStyles()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btnContainer, selected ? styles.btnSelected : styles.btnUnselected]}
    >
      <Text type="h1" style={styles.txtBtnTitle}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

type UseStylesProps = {
  hasPrimaryButtonTextAbove: boolean
  minHeight?: string
  titleTextAlignment?: "auto" | "center" | "left" | "right" | "justify"
  titleMaxWidth?: string
}

const useStyles = makeStyles(({ colors }, props: UseStylesProps) => ({
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  limitText: {},
  modalBody: {
    rowGap: 8,
  },
  columnContainer: {
    flexDirection: "row",
    paddingBottom: 100,
  },
  cellContainer: {
    flex: 1,
    alignItems: "center",
  },
  btnContainer: {
    borderWidth: 1,
    width: "97%",
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    borderRadius: 5,
    marginBottom: 10,
  },
  txtBtnTitle: {
    fontSize: 24,
    fontWeight: Platform.OS === "ios" ? "600" : "700",
    lineHeight: 32,
    maxWidth: "80%",
    textAlign: "center",
    color: colors.black,
  },
  btnSelected: {
    // backgroundColor: colors.grey5,
    backgroundColor: colors._lighterBlue,
    borderColor: colors._borderBlue,
  },
  btnUnselected: {
    backgroundColor: colors.grey5,
    borderColor: colors.greyOutline,
  },
}))
