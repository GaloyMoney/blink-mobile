import React, { useEffect, useState } from "react"
import { Colors, Text, useTheme } from "@rneui/themed"
import styled from "styled-components/native"
import {
  recommendedFees,
  RecommendedFees,
} from "@breeztech/react-native-breez-sdk-liquid"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useActivityIndicator } from "@app/hooks"

type Props = {
  selectedFeeType?: string
  onSelectFee: (type: string, value?: number) => void
}

const Fees: React.FC<Props> = ({ selectedFeeType, onSelectFee }) => {
  const { LL } = useI18nContext()
  const { colors } = useTheme().theme
  const { toggleActivityIndicator } = useActivityIndicator()

  const [fees, setFees] = useState<RecommendedFees>()

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    toggleActivityIndicator(true)
    const fees = await recommendedFees()
    console.log("Recommended fees:", fees)
    setFees(fees)
    toggleActivityIndicator(false)
  }

  return (
    <Wrapper>
      <Title>{LL.RefundFlow.recommendedFees()}</Title>
      <ButtonsWrapper>
        <FeeSelect
          colors={colors}
          activeOpacity={0.5}
          selected={selectedFeeType === "Fast"}
          onPress={() => onSelectFee("Fast", fees?.fastestFee)}
        >
          <FeeText colors={colors} selected={selectedFeeType === "Fast"}>
            {LL.RefundFlow.fast()}
          </FeeText>
        </FeeSelect>
        <FeeSelect
          colors={colors}
          activeOpacity={0.5}
          selected={selectedFeeType === "Half Hour"}
          onPress={() => onSelectFee("Half Hour", fees?.halfHourFee)}
        >
          <FeeText colors={colors} selected={selectedFeeType === "Half Hour"}>
            {LL.RefundFlow.halfHour()}
          </FeeText>
        </FeeSelect>
        <FeeSelect
          colors={colors}
          activeOpacity={0.5}
          selected={selectedFeeType === "Hour"}
          onPress={() => onSelectFee("Hour", fees?.hourFee)}
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
`

const ButtonsWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

const Title = styled(Text)`
  font-weight: bold;
  margin-bottom: 10;
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
