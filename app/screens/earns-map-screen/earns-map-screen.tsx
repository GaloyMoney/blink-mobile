import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { SvgProps } from "react-native-svg"
import { MountainHeader } from "../../components/mountain-header"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { getQuizQuestionsContent, sectionCompletedPct } from "../earns-screen"

import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { earnSections, EarnSectionType } from "../earns-screen/sections"
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
import { useQuizServer } from "./use-quiz-server"
import { makeStyles, useTheme } from "@rneui/themed"

const BottomOngoingEN = React.lazy(() => import("./bottom-ongoing-01.en.svg"))
const BottomOngoingES = React.lazy(() => import("./bottom-ongoing-01.es.svg"))
const BottomStartEN = React.lazy(() => import("./bottom-start-01.en.svg"))
const BottomStartES = React.lazy(() => import("./bottom-start-01.es.svg"))

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

type ProgressProps = {
  progress: number
}

const ProgressBar = ({ progress }: ProgressProps) => {
  const {
    theme: { colors },
  } = useTheme()

  const styles = useStyles()
  const balanceWidth = `${progress * 100}%`

  return (
    <View style={styles.progressContainer}>
      {/* pass props to style object to remove inline style */}
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{ width: balanceWidth, height: 3, backgroundColor: colors._white }} />
    </View>
  )
}

type FinishProps = {
  currSection: number
  length: number
}

export type MyQuizQuestions = {
  readonly __typename: "Quiz"
  readonly id: string
  readonly amount: number
  readonly completed: boolean
}[]

export const EarnMapScreen: React.FC = () => {
  const {
    theme: { colors },
  } = useTheme()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Earn">>()
  const { LL, locale } = useI18nContext()
  const quizQuestionsContent = getQuizQuestionsContent({ LL })
  const sections = Object.keys(earnSections) as EarnSectionType[]

  const sectionsData = sections.map((section) => ({
    index: section,
    text: LL.EarnScreen.earnSections[section].title(),
    icon: BitcoinCircle,
    onPress: () => navigation.navigate("earnsSection", { section }),
  }))
  const styles = useStyles()

  let currSection = 0
  let progress = NaN

  const { loading, quizServerData } = useQuizServer({ fetchPolicy: "network-only" })

  for (const section of sections) {
    const sectionCompletion = sectionCompletedPct({
      quizServerData,
      section,
      quizQuestionsContent,
    })

    if (sectionCompletion === 1) {
      currSection += 1
    } else if (isNaN(progress)) {
      // only do it once for the first uncompleted section
      progress = sectionCompletion
    }
  }

  const earnedSat = quizServerData
    .filter((quiz) => quiz.completed)
    .reduce((acc, { amount }) => acc + amount, 0)

  const Finish = ({ currSection, length }: FinishProps) => {
    if (currSection !== sectionsData.length) return null

    return (
      <>
        <Text style={styles.finishText}>{LL.EarnScreen.finishText()}</Text>
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
    const styles = useStyles()

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
              <View style={styles.fullView}>
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

  const SectionsComp = sectionsData
    .map((item, index) => (
      <BoxAdding
        key={item.index}
        text={item.text}
        Icon={item.icon}
        side={index % 2 ? "left" : "right"}
        position={index}
        length={sectionsData.length}
        onPress={item.onPress}
      />
    ))
    .reverse()

  const scrollViewRef: React.MutableRefObject<ScrollView | null> = React.useRef(null)

  React.useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd()
    }
  }, [])

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={colors._blue} />
        </View>
      </Screen>
    )
  }

  const backgroundColor = currSection < sectionsData.length ? colors._sky : colors._orange

  const translatedBottomOngoing = () => {
    switch (locale) {
      case "es":
        return <BottomOngoingES />
      default:
        return <BottomOngoingEN />
    }
  }

  const translatedBottomStart = () => {
    switch (locale) {
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
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd()
          }
        }}
      >
        <MountainHeader amount={earnedSat.toString()} color={backgroundColor} />
        <View style={styles.mainView}>
          <Finish currSection={currSection} length={sectionsData.length} />
          {SectionsComp}
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

const useStyles = makeStyles(({ colors }) => ({
  contentContainer: {
    backgroundColor: colors._lightBlue,
    flexGrow: 1,
  },

  finishText: {
    color: colors._white,
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
    color: colors._white,
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },

  progressContainer: { backgroundColor: colors._darkGrey, margin: 10 },

  position: { height: 40 },

  loadingView: { flex: 1, justifyContent: "center", alignItems: "center" },

  fullView: { position: "absolute", width: "100%" },
}))
