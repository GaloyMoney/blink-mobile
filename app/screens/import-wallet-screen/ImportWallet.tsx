import React, { useRef, useState } from "react"
import styled from "styled-components/native"
import { ActivityIndicator, Alert, FlatList, TextInput } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import * as Keychain from "react-native-keychain"
import * as bip39 from "bip39"

// hooks
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useCreateAccount } from "@app/hooks/useCreateAccount"
import { useTheme, useThemeMode } from "@rneui/themed"
import { usePersistentStateContext } from "@app/store/persistent-state"

// utils
import { disconnectToSDK, initializeBreezSDK } from "@app/utils/breez-sdk-liquid"

type Props = StackScreenProps<RootStackParamList, "ImportWallet">

type ShuffledPhraseType = {
  key: string
  order: number
  selectedInOrder?: boolean
}

const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

const ImportWallet: React.FC<Props> = ({ navigation, route }) => {
  const insideApp = route.params?.insideApp
  const { updateState } = usePersistentStateContext()
  const { theme } = useTheme()
  const { mode } = useThemeMode()
  const colors = theme.colors
  const { LL } = useI18nContext()
  const bottom = useSafeAreaInsets().bottom
  const inputRef = useRef<TextInput[]>([])
  const { createDeviceAccountAndLogin } = useCreateAccount()
  const [inputSeedPhrase, setInputSeedPhrase] = useState(Array(12).fill(""))
  const [loading, setLoading] = useState(false)

  const onComplete = async () => {
    setLoading(true)
    updateStateHandler(false)
    const mnemonicKey = inputSeedPhrase.join(" ").toLowerCase()
    const res = bip39.validateMnemonic(mnemonicKey)
    if (res) {
      await Keychain.setInternetCredentials(
        KEYCHAIN_MNEMONIC_KEY,
        KEYCHAIN_MNEMONIC_KEY,
        mnemonicKey,
      )
      if (insideApp) {
        await disconnectToSDK()
        await initializeBreezSDK()
        if (route.params?.onComplete) {
          route.params?.onComplete("")
        }
      } else {
        const token: any = await createDeviceAccountAndLogin()
        if (route.params?.onComplete) {
          route.params?.onComplete(token)
        }
      }
      setTimeout(() => {
        updateStateHandler(true)
        setLoading(false)
        navigation.goBack()
      }, 5000)
    } else {
      setLoading(false)
      Alert.alert("Invalid recovery phrase")
    }
  }

  const updateStateHandler = (btcWalletImported: boolean) => {
    updateState((state: any) => {
      if (state)
        return {
          ...state,
          btcTransactions: [],
          breezBalance: undefined,
          btcBalance: undefined,
          convertedBtcBalance: undefined,
          btcWalletImported,
        }
      return undefined
    })
  }

  const renderItemHandler = ({
    item,
    index,
  }: {
    item: ShuffledPhraseType
    index: number
  }) => {
    return (
      <SeedPhrase
        style={{ backgroundColor: mode === "dark" ? "#5b5b5b" : "#ededed" }}
        marginRight={index % 2 === 0}
      >
        <SeedPhraseNum style={{ borderRightColor: colors.white }}>
          <Text style={{ color: colors.black }}>{index + 1}</Text>
        </SeedPhraseNum>
        <SeedPhraseText>
          <Input
            // @ts-ignore
            ref={(el: TextInput) => (inputRef.current[index] = el)}
            value={inputSeedPhrase[index]}
            autoCapitalize="none"
            blurOnSubmit={false}
            onChangeText={(text) => {
              const updatedInput = [...inputSeedPhrase]
              updatedInput[index] = text
              setInputSeedPhrase(updatedInput)
            }}
            onSubmitEditing={() => {
              if (index === 11) {
                inputRef.current[index].blur()
              } else {
                inputRef.current[index + 1].focus()
              }
            }}
            returnKeyType={index === 11 ? "done" : "next"}
            style={{ color: colors.black }}
          />
        </SeedPhraseText>
      </SeedPhrase>
    )
  }

  const disabled = inputSeedPhrase.findIndex((el) => el === "") !== -1

  return (
    <Wrapper style={{ backgroundColor: colors.white }}>
      <Container>
        <Title style={{ color: colors.black }}>
          {insideApp ? LL.ImportWallet.importTitle() : LL.ImportWallet.title()}
        </Title>
        <Description>{LL.ImportWallet.description()}</Description>
        <FlatList
          data={inputSeedPhrase}
          numColumns={2}
          renderItem={renderItemHandler}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false}
          style={{ marginVertical: 25 }}
        />
      </Container>

      <Btn
        bottom={bottom}
        disabled={disabled}
        onPress={onComplete}
        style={{
          backgroundColor: disabled
            ? mode === "dark"
              ? "#5b5b5b"
              : "#DEDEDE"
            : "#60aa55",
        }}
      >
        <BtnTitle style={{ color: colors.white }}>{LL.ImportWallet.complete()}</BtnTitle>
      </Btn>

      {loading && (
        <LoadingWrapper>
          <ActivityIndicator size={"large"} color={"#60aa55"} />
        </LoadingWrapper>
      )}
    </Wrapper>
  )
}

export default ImportWallet

const Wrapper = styled.View`
  flex: 1;
  justify-content: space-between;
`

const Container = styled.ScrollView`
  padding-horizontal: 20px;
`

const Title = styled.Text`
  font-size: 21px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
`

const Description = styled.Text`
  font-size: 18px;
  font-weight: 400;
  color: #777;
  text-align: center;
`

const SeedPhrase = styled.View<{ marginRight: boolean }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  border-radius: 100px;
  margin-bottom: 10px;
  margin-right: ${({ marginRight }) => (marginRight ? 15 : 0)}px;
  overflow: hidden;
`
const SeedPhraseNum = styled.View<{ selectedInOrder?: boolean }>`
  width: 50px;
  height: 46px;
  align-items: center;
  justify-content: center;
  border-right-width: 2px;
`

const SeedPhraseText = styled.View`
  flex: 1;
  align-items: center;
`

const Text = styled.Text`
  font-size: 18px;
  font-weight: 600;
`

const Input = styled.TextInput`
  width: 100%;
  height: 46px;
  font-size: 18px;
  font-weight: 600;
  padding-horizontal: 5px;
`

const Btn = styled.TouchableOpacity<{
  bottom: number
}>`
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  margin-bottom: ${({ bottom }) => bottom || 10}px;
  margin-top: 10px;
  margin-horizontal: 20px;
  padding-vertical: 14px;
`

const BtnTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
`

const LoadingWrapper = styled.View`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`
