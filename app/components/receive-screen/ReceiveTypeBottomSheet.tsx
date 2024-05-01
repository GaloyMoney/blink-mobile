import React, { useState } from "react"
import { Modal } from "react-native"
import styled from "styled-components/native"
import Icon from "react-native-vector-icons/Ionicons"
import { ListItem } from "@rneui/base"
import { Text, useTheme } from "@rneui/themed"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { InvoiceType } from "@app/screens/receive-bitcoin-screen/payment/index.types"
import { useI18nContext } from "@app/i18n/i18n-react"

type Props = {
  currency: CurrencyType
  type: InvoiceType
  disabled: boolean
  onChange: (type: InvoiceType) => void
}

const ReceiveTypeBottomSheet: React.FC<Props> = ({
  currency,
  type,
  disabled,
  onChange,
}) => {
  const { LL } = useI18nContext()
  const { theme } = useTheme()
  const colors = theme.colors
  const [modalVisible, setModalVisible] = useState(false)
  const bottom = useSafeAreaInsets().bottom

  const onChangeType = (type: string) => {
    onChange(type as InvoiceType)
    setModalVisible(false)
  }

  let receivingTypes = [
    { key: "Lightning", title: "Lightning", icon: "flash" },
    { key: "PayCode", title: "Paycode", icon: "at" },
    { key: "OnChain", title: "Onchain ", icon: "logo-bitcoin" },
  ]

  if (currency === "BTC") {
    receivingTypes = receivingTypes.filter((el) => el.key !== "PayCode")
  }

  return (
    <>
      <Btn
        onPress={() => setModalVisible(true)}
        style={{ backgroundColor: colors.grey5, flex: 1 }}
        disabled={disabled}
      >
        <Row>
          <Icon
            name={receivingTypes.find((el) => el.key === type)?.icon as string}
            size={18}
            color={colors.primary}
          />
          <BtnText style={{ color: colors.black }}>
            {receivingTypes.find((el) => el.key === type)?.title}
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
              <Title>{LL.ReceiveScreen.selectPaymentMethod()}</Title>
              <Close onPress={() => setModalVisible(false)}>
                <Icon name={"close"} size={30} color={colors.black} />
              </Close>
            </TitleWrapper>

            {receivingTypes.map((el) => (
              <Btn
                key={el.key}
                style={{ backgroundColor: colors.grey4, marginBottom: 10 }}
                onPress={() => onChangeType(el.key)}
              >
                <BtnText
                  style={{ color: type === el.key ? colors.primary : colors.grey1 }}
                >
                  {el.title}
                </BtnText>
                <Icon
                  name={el.icon}
                  size={22}
                  color={type === el.key ? colors.primary : colors.grey1}
                />
              </Btn>
            ))}
          </Container>
        </Backdrop>
      </Modal>
    </>
  )
}

export default ReceiveTypeBottomSheet

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
