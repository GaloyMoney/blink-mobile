import { useApolloClient } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { StyleSheet, Text, View } from "react-native"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { SvgProps } from "react-native-svg"
import { MountainHeader } from "../../components/mountain-header"
import { Screen } from "../../components/screen"
import { getQuizQuestions } from "../../graphql/query"
import { PrimaryStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme/palette"
import { ComponentType, ScreenType } from "../../types/jsx"
import useToken from "../../hooks/use-token"
import { sectionCompletedPct } from "../earns-screen"
import { translate, getLocale } from "@app/utils/translate"

import BitcoinCircle from "./bitcoin-circle-01.svg"
import BottomOngoing from "./bottom-ongoing-01.svg"
import BottomStart from "./bottom-start-01.svg"
import LeftFinish from "./left-finished-01.svg"
import LeftLastOngoing from "./left-last-section-ongoing-01.svg"
import LeftLastTodo from "./left-last-section-to-do-01.svg"
import LeftComplete from "./left-section-completed-01.svg"
import LeftOngoing from "./left-section-ongoing-01.svg"
import LeftTodo from "./left-section-to-do-01.svg"
import RightFinish from "./right-finished-01.svg"
import RightFirst from "./right-first-section-to-do-01.svg"
import RightLastOngoing from "./right-last-section-ongoing-01.svg"
import RightLastTodo from "./right-last-section-to-do-01.svg"
import RightComplete from "./right-section-completed-01.svg"
import RightOngoing from "./right-section-ongoing-01.svg"
import RightTodo from "./right-section-to-do-01.svg"
import TextBlock from "./text-block-medium.svg"

const BottomOngoingEN = React.lazy(() => import("./bottom-ongoing-01.en.svg"))
const BottomOngoingES = React.lazy(() => import("./bottom-ongoing-01.es.svg"))
const BottomStartEN = React.lazy(() => import("./bottom-start-01.en.svg"))
const BottomStartES = React.lazy(() => import("./bottom-start-01.es.svg"))

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: palette.lightBlue,
    flexGrow: 1,
  },

  finishText: {
    color: palette.white,
    fontSize: 18,
    position: "absolute",
    right: 30,
    textAlign: "center",
    top: 30,
    width: 160,
  },

  icon: {
    marginBottom: 6,
    marginHorizontal: 10,
  },

  mainView: {
    alignSelf: "center",
  },

  textStyleBox: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },

  progressContainer: { backgroundColor: palette.darkGrey, margin: 10 },

  position: { height: 40 },
})

type SideType = "left" | "right"
interface IInBetweenTile {
  side: SideType
  position: number
  length: number
}

interface IBoxAdding {
  text: string
  Icon: React.FunctionComponent<SvgProps>
  side: SideType
  position: number
  length: number
  onPress: () => void
}

interface ISectionData {
  text: string
  index: string
  icon: React.FunctionComponent<SvgProps>
  onPress: () => void
}

interface IEarnMapScreen {
  currSection: number
  progress: number
  sectionsData: ISectionData[]
  earned: number
}

type ProgressProps = {
  progress: number
}

export const ProgressBar: ComponentType = ({ progress }: ProgressProps) => {
  const balanceWidth = `${progress * 100}%`

  return (
    <View style={styles.progressContainer}>
      {/* pass props to style object to remove inline style */}
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{ width: balanceWidth, height: 3, backgroundColor: palette.white }} />
    </View>
  )
}

type EarnMapDataProps = {
  navigation: StackNavigationProp<PrimaryStackParamList, "Earn">
}

export const EarnMapDataInjected: ScreenType = ({ navigation }: EarnMapDataProps) => {
  const { hasToken } = useToken()
  const client = useApolloClient()
  const quizQuestions = getQuizQuestions(client, { hasToken })

  if (!quizQuestions.allQuestions) {
    return null
  }

  const sectionIndexs = Object.keys(translate("EarnScreen.earns"))

  const sectionsData = []
  let currSection = 0
  let progress = NaN

  for (const sectionIndex of sectionIndexs) {
    sectionsData.push({
      index: sectionIndex,
      text: translate(`EarnScreen.earns.${sectionIndex}.meta.title`),
      icon: BitcoinCircle,
      onPress: navigation.navigate.bind(navigation.navigate, "earnsSection", {
        section: sectionIndex,
      }),
    })

    const sectionCompletion = sectionCompletedPct({ quizQuestions, sectionIndex })

    if (sectionCompletion === 1) {
      currSection += 1
    } else if (isNaN(progress)) {
      // only do it once for the first uncompleted section
      progress = sectionCompletion
    }
  }

  const earnedSat = quizQuestions.myCompletedQuestions
    ? Object.values(quizQuestions.myCompletedQuestions).reduce((a, b) => a + b, 0)
    : 0

  return (
    <EarnMapScreen
      sectionsData={sectionsData}
      currSection={currSection}
      progress={progress}
      earned={earnedSat}
    />
  )
}

type FinishProps = {
  currSection: number
  length: number
}

export const EarnMapScreen: React.FC<IEarnMapScreen> = ({
  sectionsData,
  currSection,
  progress,
  earned,
}: IEarnMapScreen) => {
  const Finish = ({ currSection, length }: FinishProps) => {
    if (currSection !== sectionsData.length) return null

    return (
      <>
        <Text style={styles.finishText}>{translate("EarnScreen.finishText")}</Text>
        {/* TODO FIXME for even section # */}
        {length % 2 ? <LeftFinish /> : <RightFinish />}
      </>
    )
  }

  const InBetweenTile: React.FC<IInBetweenTile> = ({
    side,
    position,
    length,
  }: IInBetweenTile) => {
    if (currSection < position) {
      if (position === length - 1) {
        return side === "left" ? <LeftLastTodo /> : <RightLastTodo />
      }

      return side === "left" ? <LeftTodo /> : <RightTodo />
    }
    if (currSection === position) {
      if (position === length - 1) {
        return (
          <>
            <View style={styles.position} />
            {side === "left" ? <LeftLastOngoing /> : <RightLastOngoing />}
          </>
        )
      }

      if (position === 0 && progress === 0) {
        return <RightFirst />
      }

      return side === "left" ? <LeftOngoing /> : <RightOngoing />
    }
    return side === "left" ? <LeftComplete /> : <RightComplete />
  }

  const BoxAdding: React.FC<IBoxAdding> = ({
    text,
    Icon,
    side,
    position,
    length,
    onPress,
  }: IBoxAdding) => {
    const disabled = currSection < position
    const progressSection = disabled ? 0 : currSection > position ? 1 : progress

    // rework this to pass props into the style object
    const boxStyle = StyleSheet.create({
      container: {
        position: "absolute",
        bottom:
          currSection === position ? (currSection === 0 && progress === 0 ? 30 : 80) : 30,
        left: side === "left" ? 35 : 200,
        opacity: disabled ? 0.5 : 1,
      },
    })

    return (
      <View>
        <InBetweenTile side={side} position={position} length={length} />

        <View style={boxStyle.container}>
          <View>
            <TouchableOpacity disabled={disabled} onPress={onPress}>
              <TextBlock />
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <View style={{ position: "absolute", width: "100%" }}>
                <ProgressBar progress={progressSection} />
                <Icon style={styles.icon} width={50} height={50} />
                <Text style={styles.textStyleBox}>{text}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  const sectionsComp = []

  sectionsData.forEach((item, index) => {
    sectionsComp.unshift(
      <BoxAdding
        key={item.index}
        text={item.text}
        Icon={item.icon}
        side={index % 2 ? "left" : "right"}
        position={index}
        length={sectionsData.length}
        onPress={item.onPress}
      />,
    )
  })

  const scrollViewRef: React.MutableRefObject<ScrollView> = React.useRef()

  React.useEffect(() => {
    scrollViewRef.current.scrollToEnd()
  }, [])

  const backgroundColor = currSection < sectionsData.length ? palette.sky : palette.orange

  const translatedBottomOngoing = () => {
    switch (getLocale()) {
      case "es":
        return <BottomOngoingES />
      default:
        return <BottomOngoingEN />
    }
  }

  const translatedBottomStart = () => {
    switch (getLocale()) {
      case "es":
        return <BottomStartES />
      default:
        return <BottomStartEN />
    }
  }

  return (
    <Screen unsafe statusBar="light-content">
      <ScrollView
        // removeClippedSubviews={true}
        style={{ backgroundColor }}
        contentContainerStyle={styles.contentContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => {
          scrollViewRef.current.scrollToEnd()
        }}
      >
        <MountainHeader amount={earned.toString()} color={backgroundColor} />
        {/* <View style={{backgroundColor: palette.sky}}>
          <Top width={screenWidth} />
        </View> */}
        <View style={styles.mainView}>
          <Finish currSection={currSection} length={sectionsData.length} />
          {sectionsComp}
          {currSection === 0 ? (
            progress === 0 ? (
              <React.Suspense fallback={<BottomStart />}>
                {translatedBottomStart()}
              </React.Suspense>
            ) : (
              <React.Suspense fallback={<BottomOngoing />}>
                {translatedBottomOngoing()}
              </React.Suspense>
            )
          ) : (
            <View style={styles.position} />
          )}
        </View>
      </ScrollView>
    </Screen>
  )
}
