import React from "react"

import ArrowRight from "@app/assets/icons-redesign/arrow-right.svg"
import BackSpace from "@app/assets/icons-redesign/back-space.svg"
import Bank from "@app/assets/icons-redesign/bank.svg"
import Bitcoin from "@app/assets/icons-redesign/bitcoin.svg"
import Book from "@app/assets/icons-redesign/book.svg"
import BtcBook from "@app/assets/icons-redesign/btc-book.svg"
import CaretDown from "@app/assets/icons-redesign/caret-down.svg"
import CaretLeft from "@app/assets/icons-redesign/caret-left.svg"
import CaretRight from "@app/assets/icons-redesign/caret-right.svg"
import CaretUp from "@app/assets/icons-redesign/caret-up.svg"
import CheckCircle from "@app/assets/icons-redesign/check-circle.svg"
import Check from "@app/assets/icons-redesign/check.svg"
import Close from "@app/assets/icons-redesign/close.svg"
import Coins from "@app/assets/icons-redesign/coins.svg"
import Contact from "@app/assets/icons-redesign/contact.svg"
import CopyPaste from "@app/assets/icons-redesign/copy-paste.svg"
import Dollar from "@app/assets/icons-redesign/dollar.svg"
import EyeSlash from "@app/assets/icons-redesign/eye-slash.svg"
import Eye from "@app/assets/icons-redesign/eye.svg"
import Filter from "@app/assets/icons-redesign/filter.svg"
import Graph from "@app/assets/icons-redesign/graph.svg"
import Image from "@app/assets/icons-redesign/image.svg"
import Info from "@app/assets/icons-redesign/info.svg"
import Lightning from "@app/assets/icons-redesign/lightning.svg"
import Link from "@app/assets/icons-redesign/link.svg"
import Loading from "@app/assets/icons-redesign/loading.svg"
import MagnifyingGlass from "@app/assets/icons-redesign/magnifying-glass.svg"
import Map from "@app/assets/icons-redesign/map.svg"
import Menu from "@app/assets/icons-redesign/menu.svg"
import Pencil from "@app/assets/icons-redesign/pencil.svg"
import QrCode from "@app/assets/icons-redesign/qr-code.svg"
import Question from "@app/assets/icons-redesign/question.svg"
import Receive from "@app/assets/icons-redesign/receive.svg"
import Send from "@app/assets/icons-redesign/send.svg"
import Settings from "@app/assets/icons-redesign/settings.svg"
import Share from "@app/assets/icons-redesign/share.svg"
import Transfer from "@app/assets/icons-redesign/transfer.svg"
import User from "@app/assets/icons-redesign/user.svg"
import Video from "@app/assets/icons-redesign/video.svg"
import Warning from "@app/assets/icons-redesign/warning.svg"
import PaymentSuccess from "@app/assets/icons-redesign/payment-success.svg"
import PaymentPending from "@app/assets/icons-redesign/payment-pending.svg"
import PaymentError from "@app/assets/icons-redesign/payment-error.svg"
import { makeStyles, useTheme } from "@rneui/themed"
import { StyleProp, View, ViewStyle } from "react-native"

const icons = {
  "arrow-right": ArrowRight,
  "back-space": BackSpace,
  "bank": Bank,
  "bitcoin": Bitcoin,
  "book": Book,
  "btc-book": BtcBook,
  "caret-down": CaretDown,
  "caret-left": CaretLeft,
  "caret-right": CaretRight,
  "caret-up": CaretUp,
  "check-circle": CheckCircle,
  "check": Check,
  "close": Close,
  "coins": Coins,
  "contact": Contact,
  "copy-paste": CopyPaste,
  "dollar": Dollar,
  "eye-slash": EyeSlash,
  "eye": Eye,
  "filter": Filter,
  "graph": Graph,
  "image": Image,
  "info": Info,
  "lightning": Lightning,
  "link": Link,
  "loading": Loading,
  "magnifying-glass": MagnifyingGlass,
  "map": Map,
  "menu": Menu,
  "pencil": Pencil,
  "qr-code": QrCode,
  "question": Question,
  "receive": Receive,
  "send": Send,
  "settings": Settings,
  "share": Share,
  "transfer": Transfer,
  "user": User,
  "video": Video,
  "warning": Warning,
  "payment-success": PaymentSuccess,
  "payment-pending": PaymentPending,
  "payment-error": PaymentError,
} as const

export type IconNamesType = keyof typeof icons
export const IconNames = Object.keys(icons)

type GaloyIconProps = {
  name: IconNamesType
  size: number
  color?: string
  style?: StyleProp<ViewStyle>
  backgroundColor?: string
  opacity?: number
}

export const circleDiameterThatContainsSquare = (squareSize: number) => {
  const SQRT2 = 1.414
  return Math.round(squareSize * SQRT2)
}

export const GaloyIcon = ({
  name,
  size,
  color,
  style,
  backgroundColor,
  opacity,
}: GaloyIconProps) => {
  const { theme } = useTheme()
  const styles = useStyles({ backgroundColor, opacity, size })
  const Icon = icons[name]

  return backgroundColor ? (
    <View style={[style, styles.iconContainerStyle]}>
      <Icon
        width={size}
        opacity={opacity || 1}
        height={size}
        color={color || theme.colors.black}
        fontWeight={"600"}
      />
    </View>
  ) : (
    <Icon
      opacity={opacity || 1}
      width={size}
      height={size}
      color={color || theme.colors.black}
      style={style}
      fontWeight={"600"}
    />
  )
}

type UseStylesProps = {
  backgroundColor?: string
  opacity?: number
  size: number
}

const useStyles = makeStyles((_, { backgroundColor, opacity, size }: UseStylesProps) => {
  const containerSize = circleDiameterThatContainsSquare(size)
  return {
    iconContainerStyle: {
      opacity: opacity || 1,
      backgroundColor,
      borderRadius: containerSize,
      width: containerSize,
      height: containerSize,
      alignItems: "center",
      justifyContent: "center",
    },
  }
})
