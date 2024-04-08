import React from "react"
import styled from "styled-components/native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StackScreenProps } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useTheme } from "@rneui/themed"

type Props = StackScreenProps<RootStackParamList, "BackupStart">

const BackupStart: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme()
  const colors = theme.colors
  const { LL } = useI18nContext()
  const bottom = useSafeAreaInsets().bottom

  const onContinue = () => {
    navigation.navigate("BackupSeedPhrase")
  }

  return (
    <Wrapper style={{ backgroundColor: colors.white }}>
      <Container>
        <Title style={{ color: colors.black }}>{LL.BackupStart.title()}</Title>
        <Description>{LL.BackupStart.description()}</Description>
      </Container>
      <Btn bottom={bottom} onPress={onContinue}>
        <BtnTitle style={{ color: colors.white }}>{LL.BackupStart.continue()}</BtnTitle>
      </Btn>
    </Wrapper>
  )
}

export default BackupStart

const Wrapper = styled.View`
  flex: 1;
  justify-content: space-between;
  padding-horizontal: 20px;
`

const Container = styled.View``

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

const Btn = styled.TouchableOpacity<{ bottom: number }>`
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: #60aa55;
  margin-bottom: ${({ bottom }) => bottom || 10}px;
  padding-vertical: 14px;
`

const BtnTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
`
