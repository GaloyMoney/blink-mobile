import React, { useEffect, useState } from "react"
import { StackScreenProps } from "@react-navigation/stack"
import styled from "styled-components/native"
import { Icon } from "@rneui/themed"
import * as Keychain from "react-native-keychain"

// hooks
import { useAppConfig } from "@app/hooks"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useFeatureFlags } from "@app/config/feature-flags-context"
import useAppCheckToken from "../get-started-screen/use-device-token"

// types
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// utils
import { logGetStartedAction } from "@app/utils/analytics"

const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

type Props = StackScreenProps<RootStackParamList, "ImportWalletOptions">

const ImportWalletOptions: React.FC<Props> = ({ navigation, route }) => {
  const insideApp = route.params?.insideApp
  const bottom = useSafeAreaInsets().bottom
  const { LL } = useI18nContext()
  const { saveToken } = useAppConfig()
  const { deviceAccountEnabled } = useFeatureFlags()
  const [appCheckToken] = useAppCheckToken({ skip: !deviceAccountEnabled })
  const [BTCWalletImported, setBTCWalletImported] = useState(false)
  const [USDWalletImported, setUSDWalletImported] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [token, setToken] = useState<string | undefined>("")

  useEffect(() => {
    if (!insideApp) {
      navigation.addListener("beforeRemove", beforeRemoveListener)
      return () => navigation.removeListener("beforeRemove", beforeRemoveListener)
    }
  }, [])

  const beforeRemoveListener = (e: any) => {
    if (e.data.action.type === "POP") {
      Keychain.resetInternetCredentials(KEYCHAIN_MNEMONIC_KEY)
    }
  }

  const onImportBTCWallet = () => {
    navigation.navigate("ImportWallet", {
      insideApp,
      onComplete: (token) => {
        setBTCWalletImported(true)
        setToken(token)
      },
    })
  }

  const onLoginWithPhone = () => {
    logGetStartedAction({
      action: "log_in",
      createDeviceAccountEnabled: Boolean(appCheckToken),
    })
    navigation.navigate("phoneFlow", {
      onComplete: (token) => {
        setUSDWalletImported(true)
        setPhoneVerified(true)
        setToken(token)
      },
    })
  }

  const onLoginWithEmail = () => {
    logGetStartedAction({
      action: "login_with_email",
      createDeviceAccountEnabled: Boolean(appCheckToken),
    })

    navigation.navigate("emailLoginInitiate", {
      onComplete: (token) => {
        setUSDWalletImported(true)
        setEmailVerified(true)
        setToken(token)
      },
    })
  }

  const onLogin = async () => {
    if (!insideApp) {
      if (token) {
        saveToken(token)
        navigation.replace("Primary")
      } else {
        alert("Login failed. Please try again")
      }
    } else {
      navigation.goBack()
    }
  }

  return (
    <Wrapper>
      <Container>
        <Title>
          {insideApp
            ? LL.ImportWalletOptions.importOptions()
            : LL.ImportWalletOptions.loginOptions()}
        </Title>

        <Btn onPress={onImportBTCWallet} disabled={BTCWalletImported}>
          <Icon
            type="ionicon"
            name={BTCWalletImported ? "checkmark-circle" : "checkmark-circle-outline"}
            color={BTCWalletImported ? "#60aa55" : "#999"}
            size={40}
          />
          <BtnTextWrapper>
            <BtnTitle>{LL.ImportWalletOptions.recoveryPhrase()}</BtnTitle>
            <BtnDesc>{LL.ImportWalletOptions.importBTCWallet()}</BtnDesc>
          </BtnTextWrapper>
          {!BTCWalletImported && (
            <Icon type="ionicon" name={"chevron-forward"} size={20} />
          )}
        </Btn>
        <Btn onPress={onLoginWithPhone} disabled={USDWalletImported}>
          <Icon
            type="ionicon"
            name={
              USDWalletImported && phoneVerified
                ? "checkmark-circle"
                : "checkmark-circle-outline"
            }
            color={USDWalletImported && phoneVerified ? "#60aa55" : "#999"}
            size={40}
          />
          <BtnTextWrapper>
            <BtnTitle>{LL.ImportWalletOptions.phone()}</BtnTitle>
            <BtnDesc>{LL.ImportWalletOptions.importUsingPhone()}</BtnDesc>
          </BtnTextWrapper>
          {!USDWalletImported && (
            <Icon type="ionicon" name={"chevron-forward"} size={20} />
          )}
        </Btn>
        <Btn onPress={onLoginWithEmail} disabled={USDWalletImported}>
          <Icon
            type="ionicon"
            name={
              USDWalletImported && emailVerified
                ? "checkmark-circle"
                : "checkmark-circle-outline"
            }
            color={USDWalletImported && emailVerified ? "#60aa55" : "#999"}
            size={40}
          />
          <BtnTextWrapper>
            <BtnTitle>{LL.ImportWalletOptions.email()}</BtnTitle>
            <BtnDesc>{LL.ImportWalletOptions.importUsingEmail()}</BtnDesc>
          </BtnTextWrapper>
          {!USDWalletImported && (
            <Icon type="ionicon" name={"chevron-forward"} size={20} />
          )}
        </Btn>
      </Container>
      <MainBtn
        disabled={!BTCWalletImported && !USDWalletImported}
        bottom={bottom}
        onPress={onLogin}
      >
        <MainBtnTitle>
          {insideApp ? LL.ImportWalletOptions.done() : LL.ImportWalletOptions.login()}
        </MainBtnTitle>
      </MainBtn>
    </Wrapper>
  )
}

export default ImportWalletOptions

const Wrapper = styled.View`
  flex: 1;
  background-color: #fff;
  justify-content: space-between;
  padding-horizontal: 20px;
`

const Container = styled.View``

const Title = styled.Text`
  font-size: 21px;
  font-weight: 600;
  color: #000;
  text-align: center;
  margin-bottom: 30px;
`

const Btn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-radius: 10px;
  border: 1px solid #dedede;
  margin-bottom: 20px;
  padding-vertical: 20px;
  padding-horizontal: 20px;
`

const BtnTextWrapper = styled.View`
  flex: 1;
  margin-horizontal: 15px;
`

const BtnTitle = styled.Text`
  font-size: 18px;
  color: #000;
`

const BtnDesc = styled.Text`
  font-size: 15px;
  color: #777;
`

const MainBtn = styled.TouchableOpacity<{
  disabled?: boolean
  bottom: number
}>`
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: ${({ disabled }) => (disabled ? "#DEDEDE" : "#60aa55")};
  margin-bottom: ${({ bottom }) => bottom || 10}px;
  padding-vertical: 14px;
`

const MainBtnTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`
