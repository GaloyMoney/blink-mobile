import { gql, useQuery } from "@apollo/client"
import * as React from "react"
import * as _ from "lodash"
import { StatusBar, StyleSheet, Text, View } from "react-native"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { MountainHeader } from "../../components/mountain-header"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { Token } from "../../utils/token"
import { sectionCompletedPct } from "../earns-screen"
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
  section: string
  Icon: React.Component
  side: SideType
  position: number
  length: number
}

interface ISectionData {
  text: string
  index: string
  icon: React.Component
}

interface IEarnMapScreen {
  navigation: Record<string, any> // FIXME
  currSection: number
  progress: number
  sectionsData: ISectionData[]
  earned: number
}

type ProgressProps = {
  progress: number
}

export const ProgressBar = ({ progress }: ProgressProps) => {
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
  navigation: Record<string, any>
}

export const EarnMapDataInjected = ({ navigation }: EarnMapDataProps) => {
  // TODO: fragment with earnList
  const { data } = useQuery(
    gql`
      query earnList($logged: Boolean!) {
        earnList {
          id
          value
          completed @client(if: { not: $logged })
        }
      }
    `,
    {
      variables: {
        logged: new Token().has(),
      },
      fetchPolicy: "cache-only",
    },
  )

  if (!data) {
    return null
  }

  const { earnList } = data

  const sectionIndexs = Object.keys(translate("EarnScreen.earns"))

  const sectionsData = []
  let currSection = 0
  let progress = NaN

  for (const sectionIndex of sectionIndexs) {
    sectionsData.push({
      index: sectionIndex,
      text: translate(`EarnScreen.earns.${sectionIndex}.meta.title`),
      icon: BitcoinCircle,
    })

    const sectionCompletion = sectionCompletedPct({ sectionIndex, earnList })

    if (sectionCompletion === 1) {
      currSection += 1
    } else if (isNaN(progress)) {
      // only do it once for the first uncompleted section
      progress = sectionCompletion
    }
  }

  const earnedSat = _.sumBy(_.filter(earnList, { completed: true }), "value")

  return (
    <EarnMapScreen
      navigation={navigation}
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
  navigation,
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
    section,
    length,
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
            <TouchableOpacity
              disabled={disabled}
              onPress={() => navigation.navigate("earnsSection", { section })}
            >
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
        text={item.text}
        Icon={item.icon}
        side={index % 2 ? "left" : "right"}
        position={index}
        section={item.index}
        length={sectionsData.length}
      />,
    )
  })

  const scrollViewRef = React.useRef()

  React.useEffect(() => {
    scrollViewRef.current.scrollToEnd()
  }, [])

  const backgroundColor = currSection < sectionsData.length ? palette.sky : palette.orange

  React.useEffect(() => {
    const unsubscribe = navigation?.addListener("focus", () => {
      StatusBar.setBackgroundColor(color.transparent)
      StatusBar.setBarStyle("light-content")
      StatusBar.setTranslucent(true)
    })

    return unsubscribe
  }, [navigation])

  React.useEffect(() => {
    const unsubscribe = navigation?.addListener("blur", () => {
      StatusBar.setTranslucent(false)
      StatusBar.setBarStyle("dark-content")
      StatusBar.setBackgroundColor(palette.lighterGrey)
    })

    return unsubscribe
  }, [navigation])

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
        <MountainHeader amount={earned} color={backgroundColor} />
        {/* <View style={{backgroundColor: palette.sky}}>
          <Top width={screenWidth} />
        </View> */}
        <View style={styles.mainView}>
          <Finish currSection={currSection} length={sectionsData.length} />
          {sectionsComp}
          {currSection === 0 ? (
            progress === 0 ? (
              <BottomStart />
            ) : (
              <BottomOngoing />
            )
          ) : (
            <View style={styles.position} />
          )}
        </View>
      </ScrollView>
    </Screen>
  )
}
