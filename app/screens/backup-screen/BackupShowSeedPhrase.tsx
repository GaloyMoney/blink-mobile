import React, { useEffect, useState } from "react"
import styled from "styled-components/native"
import { FlatList } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import * as Keychain from "react-native-keychain"

type Props = StackScreenProps<RootStackParamList, "BackupShowSeedPhrase">

const BackupShowSeedPhrase: React.FC<Props> = ({ navigation }) => {
  const { LL } = useI18nContext()
  const bottom = useSafeAreaInsets().bottom
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])

  useEffect(() => {
    getSeedPhrase()
  }, [])

  const getSeedPhrase = async () => {
    const credentials = await Keychain.getInternetCredentials("mnemonic_key")
    if (credentials) {
      setSeedPhrase(credentials.password.split(" "))
    }
  }

  const onDone = () => {
    navigation.navigate("Primary")
  }

  const renderItemHandler = ({ item, index }: { item: string; index: number }) => {
    return (
      <SeedPhrase marginRight={index % 2 === 0}>
        <SeedPhraseNum>
          <Text>{index + 1}</Text>
        </SeedPhraseNum>
        <SeedPhraseText>
          <Text>{item}</Text>
        </SeedPhraseText>
      </SeedPhrase>
    )
  }

  return (
    <Wrapper>
      <Container>
        <Title>{LL.BackupShowSeedPhrase.title()}</Title>
        <Description>{LL.BackupShowSeedPhrase.description()}</Description>
        <FlatList
          data={seedPhrase}
          numColumns={2}
          renderItem={renderItemHandler}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false}
          style={{ marginVertical: 25 }}
        />
      </Container>
      <Btn bottom={bottom} onPress={onDone}>
        <BtnTitle>{LL.BackupShowSeedPhrase.done()}</BtnTitle>
      </Btn>
    </Wrapper>
  )
}

export default BackupShowSeedPhrase

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
`
const SeedPhraseNum = styled.View`
  width: 50px;
  align-items: center;
  border-right-width: 2px;
  border-right-color: #fff;
  padding-left: 5px;
  padding-vertical: 14px;
`

const SeedPhraseText = styled.View`
  align-items: center;
  flex: 1;
`

const Text = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #000;
`

const Btn = styled.TouchableOpacity<{ isOutline?: boolean; bottom: number }>`
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: ${({ isOutline }) => (isOutline ? "#fff" : "#60aa55")};
  border: ${({ isOutline }) => (isOutline ? 1 : 0)}px solid #bbb;
  margin-bottom: ${({ bottom }) => bottom}px;
  margin-top: 10px;
  margin-horizontal: 20px;
  padding-vertical: 14px;
`

const BtnTitle = styled.Text<{ isOutline?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ isOutline }) => (isOutline ? "#000" : "#fff")};
`
