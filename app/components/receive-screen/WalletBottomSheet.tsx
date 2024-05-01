import React, { useState } from "react"
import styled from "styled-components/native"
import Icon from "react-native-vector-icons/Ionicons"
import { Modal } from "react-native"
import { GaloyCurrencyBubble } from "../atomic/galoy-currency-bubble"
import { ListItem } from "@rneui/base"
import { useTheme, Text } from "@rneui/themed"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { WalletCurrency } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"

const wallets = [
  { title: "Cash", key: "USD" },
  { title: "Bitcoin", key: "BTC" },
]

type Props = {
  currency: WalletCurrency
  disabled: boolean
  onChange: (currency: WalletCurrency) => void
}

const WalletBottomSheet: React.FC<Props> = ({ currency, disabled, onChange }) => {
  const { LL } = useI18nContext()
  const { theme } = useTheme()
  const colors = theme.colors
  const [modalVisible, setModalVisible] = useState(false)
  const bottom = useSafeAreaInsets().bottom

  const onChangeCurrency = (currency: string) => {
    onChange(currency as WalletCurrency)
    setModalVisible(false)
  }

  return (
    <>
      <Btn
        onPress={() => setModalVisible(true)}
        style={{ backgroundColor: colors.grey5, flex: 1 }}
        disabled={disabled}
      >
        <Row>
          <GaloyCurrencyBubble currency={currency} iconSize={16} />
          <BtnText style={{ color: colors.black }}>
            {currency === "USD" ? "Cash" : "Bitcoin"}
          </BtnText>
        </Row>
        <ListItem.Chevron
          name={modalVisible ? "chevron-up" : "chevron-down"}
          color={colors.grey0}
          size={20}
          type="ionicon"
        />
      </Btn>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Backdrop
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
          mode={theme.mode}
        >
          <Container pb={bottom} style={{ backgroundColor: colors.white }}>
            <TitleWrapper>
              <Title>{LL.ReceiveScreen.selectWallet()}</Title>
              <Close onPress={() => setModalVisible(false)}>
                <Icon name={"close"} size={30} color={colors.black} />
              </Close>
            </TitleWrapper>
            {wallets.map((el) => (
              <Btn
                key={el.key}
                onPress={() => onChangeCurrency(el.key)}
                style={{ backgroundColor: colors.grey4, marginBottom: 10 }}
              >
                <BtnText
                  style={{ color: currency === el.key ? colors.primary : colors.grey1 }}
                >
                  {el.title}
                </BtnText>
                <GaloyCurrencyBubble currency={el.key as WalletCurrency} iconSize={16} />
              </Btn>
            ))}
          </Container>
        </Backdrop>
      </Modal>
    </>
  )
}

export default WalletBottomSheet

const Btn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  padding-vertical: 15px;
  padding-horizontal: 10px;
`

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`

const BtnText = styled.Text`
  font-size: 17px;
  margin-left: 5px;
`

const Backdrop = styled.TouchableOpacity<{ mode: string }>`
  flex: 1;
  justify-content: flex-end;
  background-color: ${({ mode }) =>
    mode === "dark" ? "rgba(57,57,57,.7)" : "rgba(0,0,0,.5)"};
`

const Container = styled.View<{ pb: number }>`
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding-bottom: ${({ pb }) => pb || 10}px;
  padding-top: 20px;
  padding-horizontal: 20px;
`

const TitleWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`

const Title = styled(Text)`
  font-size: 20px;
`

const Close = styled.TouchableOpacity`
  padding: 5px;
`
