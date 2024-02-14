import React, { useRef, useState } from "react"
import styled from "styled-components/native"
import { ActivityIndicator, Alert, FlatList, TextInput } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useCreateAccount } from "@app/hooks"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import * as Keychain from "react-native-keychain"
import * as bip39 from "bip39"

type Props = StackScreenProps<RootStackParamList, "ImportWallet">

type ShuffledPhraseType = {
  key: string
  order: number
  selectedInOrder?: boolean
}

const KEYCHAIN_MNEMONIC_KEY = "mnemonic_key"

const ImportWallet: React.FC<Props> = ({ navigation, route }) => {
  const { LL } = useI18nContext()
  const bottom = useSafeAreaInsets().bottom
  const inputRef = useRef<TextInput[]>([])
  const { createDeviceAccountAndLogin } = useCreateAccount()
  const [inputSeedPhrase, setInputSeedPhrase] = useState(Array(12).fill(""))
  const [loading, setLoading] = useState(false)

  const onComplete = async () => {
    setLoading(true)
    const mnemonicKey = inputSeedPhrase.join(" ").toLowerCase()
    const res = bip39.validateMnemonic(mnemonicKey)
    if (res) {
      await Keychain.setInternetCredentials(
        KEYCHAIN_MNEMONIC_KEY,
        KEYCHAIN_MNEMONIC_KEY,
        mnemonicKey,
      )
      const token: any = await createDeviceAccountAndLogin()
      if (route.params?.onComplete) {
        route.params?.onComplete(token)
      }
      navigation.goBack()
    } else {
      Alert.alert("Invalid recovery phrase")
    }
    setLoading(false)
  }

  const renderItemHandler = ({
    item,
    index,
  }: {
    item: ShuffledPhraseType
    index: number
  }) => {
    return (
      <SeedPhrase marginRight={index % 2 === 0}>
        <SeedPhraseNum>
          <Text>{index + 1}</Text>
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
          />
        </SeedPhraseText>
      </SeedPhrase>
    )
  }

  return (
    <Wrapper>
      <Container>
        <Title>{LL.ImportWallet.title()}</Title>
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
      <ButtonsWrapper>
        <Btn
          bottom={bottom}
          disabled={inputSeedPhrase.findIndex((el) => el === "") !== -1}
          onPress={onComplete}
        >
          <BtnTitle>{LL.ImportWallet.complete()}</BtnTitle>
        </Btn>
      </ButtonsWrapper>
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
  background-color: #fff;
  justify-content: space-between;
`

const Container = styled.ScrollView`
  padding-horizontal: 20px;
`

const Title = styled.Text`
  font-size: 21px;
  font-weight: 600;
  color: #000;
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
  background-color: #ededed;
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
  border-right-color: #fff;
`

const SeedPhraseText = styled.View`
  flex: 1;
  align-items: center;
`

const Text = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #000;
`

const Input = styled.TextInput`
  width: 100%;
  height: 46px;
  font-size: 18px;
  font-weight: 600;
  color: #000;
  padding-horizontal: 5px;
`

const ButtonsWrapper = styled.View`
  padding-top: 10px;
  padding-horizontal: 20px;
`

const Btn = styled.TouchableOpacity<{
  isOutline?: boolean
  disabled?: boolean
  bottom: number
}>`
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: ${({ isOutline, disabled }) =>
    isOutline ? "#fff" : disabled ? "#DEDEDE" : "#60aa55"};
  border: ${({ isOutline }) => (isOutline ? 1 : 0)}px solid #bbb;
  margin-bottom: ${({ bottom }) => bottom}px;
  padding-vertical: 14px;
`

const BtnTitle = styled.Text<{ isOutline?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ isOutline }) => (isOutline ? "#000" : "#fff")};
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
