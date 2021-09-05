import { StackNavigationProp } from "@react-navigation/stack"
import { SvgProps } from "react-native-svg"
import { PrimaryStackParamList } from "../../navigation/stack-param-lists"

type SideType = "left" | "right"

export interface IInBetweenTile {
  side: SideType
  position: number
  length: number
  currSection: number
  progress: number
}

export interface IBoxAdding {
  text: string
  Icon: React.FunctionComponent<SvgProps>
  side: SideType
  position: number
  length: number
  onPress: () => void
  currSection: number
  progress: number
}

export interface ISectionData {
  text: string
  index: string
  icon: React.FunctionComponent<SvgProps>
  onPress: () => void
}

export interface IEarnMapScreen {
  currSection: number
  progress: number
  sectionsData: ISectionData[]
  earned: number
}

export type ProgressProps = {
  progress: number
}

export type FinishProps = {
  currSection: number
  sectionsData: ISectionData[]
}

export type EarnMapDataProps = {
  navigation: StackNavigationProp<PrimaryStackParamList, "Earn">
}
