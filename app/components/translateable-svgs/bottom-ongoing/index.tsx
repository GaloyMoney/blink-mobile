import { useI18nContext } from "@app/i18n/i18n-react"
import { G, Rect, Svg, TSpan, Text } from "react-native-svg"

export default function BottomOngoing() {
  const { LL } = useI18nContext()

  return (
    <Svg
      id="Layer_1"
      x="0px"
      y="0px"
      width="375px"
      height="135px"
      viewBox="0 0 375 135"
      enable-background="new 0 0 375 135"
    >
      <G>
        <Rect fill="#3654FF" width="374.999" height="135" />
        <G>
          <Rect x="196.216" y="31.725" fill="none" width="147.567" height="74.275" />
          <Text transform="matrix(1 0 0 1 220.3525 43.2446)">
            <TSpan x="0" y="0" fill="#FFFFFF" font-size="16">
              {LL.EarnScreen.motivatingBadger()}
            </TSpan>
            {/* <TSpan x="-4.784" y="19" fill="#FFFFFF" font-size="16">
              {LL.EarnScreen.motivatingBadger2()}
            </TSpan>
            <TSpan x="-15.456" y="38" fill="#FFFFFF" font-size="16">
              {LL.EarnScreen.motivatingBadger3()}
            </TSpan>
            <TSpan x="3.032" y="57" fill="#FFFFFF" font-size="16">
              {LL.EarnScreen.motivatingBadger4()}
            </TSpan> */}
          </Text>
        </G>
      </G>
    </Svg>
  )
}
