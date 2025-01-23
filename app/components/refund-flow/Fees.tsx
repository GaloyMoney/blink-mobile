import React from "react"
import { ViewStyle } from "react-native"
import { Colors, Text, useTheme } from "@rneui/themed"
import styled from "styled-components/native"
import { RecommendedFees } from "@breeztech/react-native-breez-sdk-liquid"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"

type Props = {
  wrapperStyle?: ViewStyle
  recommendedFees?: RecommendedFees
  selectedFeeType?: string
  onSelectFee: (type: string, value?: number) => void
}

const Fees: React.FC<Props> = ({
  wrapperStyle,
  recommendedFees,
  selectedFeeType,
  onSelectFee,
}) => {
  const { LL } = useI18nContext()
  const { colors } = useTheme().theme

  return (
    <Wrapper style={wrapperStyle}>
      <Title>{LL.RefundFlow.recommendedFees()}</Title>
      <ButtonsWrapper>
        <FeeSelect
          colors={colors}
          activeOpacity={0.5}
          selected={selectedFeeType === "Fast"}
          onPress={() => onSelectFee("Fast", recommendedFees?.fastestFee)}
        >
          <FeeText colors={colors} selected={selectedFeeType === "Fast"}>
            {LL.RefundFlow.fast()}
          </FeeText>
        </FeeSelect>
        <FeeSelect
          colors={colors}
          activeOpacity={0.5}
          selected={selectedFeeType === "Half Hour"}
          onPress={() => onSelectFee("Half Hour", recommendedFees?.halfHourFee)}
        >
          <FeeText colors={colors} selected={selectedFeeType === "Half Hour"}>
            {LL.RefundFlow.halfHour()}
          </FeeText>
        </FeeSelect>
        <FeeSelect
          colors={colors}
          activeOpacity={0.5}
          selected={selectedFeeType === "Hour"}
          onPress={() => onSelectFee("Hour", recommendedFees?.hourFee)}
        >
          <FeeText colors={colors} selected={selectedFeeType === "Hour"}>
            {LL.RefundFlow.hour()}
          </FeeText>
        </FeeSelect>
      </ButtonsWrapper>
    </Wrapper>
  )
}

export default Fees

const Wrapper = styled.View`
  margin-top: 10px;
  margin-bottom: 15px;
`

const ButtonsWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

const Title = styled(Text)`
  font-weight: bold;
  margin-bottom: 10px;
`

const FeeSelect = styled.TouchableOpacity<{ colors: Colors; selected: boolean }>`
  width: 30%;
  background-color: ${({ colors, selected }) => (selected ? "#60aa55" : colors.grey4)};
  border-radius: 10px;
  align-items: center;
  padding-vertical: 5px;
`

const FeeText = styled.Text<{ colors: Colors; selected: boolean }>`
  font-size: 15px;
  color: ${({ colors, selected }) => (selected ? colors.white : colors.black)};
`
