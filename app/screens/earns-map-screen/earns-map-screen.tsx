import { inject, observer } from "mobx-react"
import * as React from "react"
import { Dimensions, StyleSheet, Text, View, SafeAreaView, StatusBar } from "react-native"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { sectionCompletedPct } from "../earns-screen"
import BitcoinCircle from "./bitcoin-circle-01.svg"
import BottomOngoing from "./bottom-ongoing-01.svg"
import BottomStart from "./bottom-start-01.svg"
import LeftFinish from "./left-finished-01.svg"
import LeftComplete from "./left-section-completed-01.svg"
import LeftLastComplete from "./left-last-section-completed-01.svg"
import LeftLastOngoing from "./left-last-section-ongoing-01.svg"
import LeftLastTodo from "./left-last-section-to-do-01.svg"
import LeftOngoing from "./left-section-ongoing-01.svg"
import LeftTodo from "./left-section-to-do-01.svg"
import RightFirst from "./right-first-section-to-do-01.svg"
import RightLastComplete from "./right-last-section-completed-01.svg"
import RightLastOngoing from "./right-last-section-ongoing-01.svg"
import RightLastTodo from "./right-last-section-to-do-01.svg"
import RightFinish from "./right-finished-01.svg"
import RightComplete from "./right-section-completed-01.svg"
import RightOngoing from "./right-section-ongoing-01.svg"
import RightTodo from "./right-section-to-do-01.svg"
import TextBlock from "./text-block-medium.svg"
import { MountainHeader } from "../../components/mountain-header"
import { color } from "../../theme"
import { StoreContext } from "../../models"

const styles = StyleSheet.create({
  mainView: {
    alignSelf: "center"
  },

  textStyleBox: {
    color: palette.white,
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
  },

  icon: {
    marginHorizontal: 10,
    marginBottom: 6,
  },

  finishText: {
    position: "absolute",
    color: palette.white,
    width: 160,
    fontSize: 18,
    right: 30,
    top: 30,
    textAlign: "center",
  },
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
  navigation: object //FIXME
  currSection: number
  progress: number
  sectionsData: ISectionData[]
  earned: number
}

export const ProgressBar = ({progress}) => {
  const balanceWidth = `${progress * 100}%`

  return (
  <View style={{ backgroundColor: palette.darkGrey, margin: 10 }}>
    <View style={{ width: balanceWidth, height: 3, backgroundColor: palette.white }} />
  </View>
)}


export const EarnMapDataInjected = observer(({ navigation }) => {

  const store = React.useContext(StoreContext)
  const earnsArray = store.earnArray
  const sectionIndexs = Object.keys(translate("EarnScreen.earns"))

  let sectionsData = []
  let currSection = 0
  let progress = NaN

  
  for (let sectionIndex of sectionIndexs) {
    console.tron.log({sectionIndex})
    sectionsData.push({
      index: sectionIndex,
      text: translate(`EarnScreen.earns\.${sectionIndex}.meta.title`),
      icon: BitcoinCircle,
    })

    const sectionCompletion = sectionCompletedPct({sectionIndex, earnsArray})

    if (sectionCompletion === 1) {
      currSection += 1
    } else if (isNaN(progress)) { // only do it once for the first uncompleted section
      progress = sectionCompletion
    }
  }

  return <EarnMapScreen 
    navigation={navigation}
    sectionsData={sectionsData}
    currSection={currSection}
    progress={progress}
    earned={store.earnedSat}
  />
})

export const EarnMapScreen: React.FC<IEarnMapScreen> = 
  ({ navigation, sectionsData, currSection, progress, earned}) => {

  const Finish = ({currSection, length}) => {
    if (currSection !== sectionsData.length) return null

    return <>
      <Text style={styles.finishText}>
        That's all for now, we'll let you know when there's more to unearth
      </Text>
      {/* TODO FIXME for even section # */}
    {length % 2 ? 
        <LeftFinish /> 
      : <RightFinish />}
    </>
    }

  const InBetweenTile: React.FC<IInBetweenTile> = ({ side, position, length }) => {
    if (currSection < position) {      
      if (position === length - 1) {
        return side === "left" ? <LeftLastTodo /> : <RightLastTodo />
      }

      return side === "left" ? <LeftTodo /> : <RightTodo />
    } else if (currSection === position) {
      if (position === length - 1) {
        return <>
          <View style={{height: 40}}/>
          {side === "left" ? <LeftLastOngoing /> : <RightLastOngoing />}
        </>
      }

      if (position === 0 && progress === 0) {
        return <RightFirst />
      }

      return side === "left" ? <LeftOngoing /> : <RightOngoing />
    } else {
      return side === "left" ? <LeftComplete /> : <RightComplete />
    }
  }

  const BoxAdding: React.FC<IBoxAdding> = ({ text, Icon, side, position, section, length }) => {
    const disabled = currSection < position
    const progressSection = disabled ? 0 : currSection > position ? 1 : progress
    return (<View>
      <InBetweenTile side={side} position={position} length={length}/>
      <View style={{
        position: "absolute", 
        bottom: currSection === position ? 
          currSection === 0 && progress === 0 ?
            30
          : 80
        : 30, 
        left: side === "left" ? 35 : 200,
        opacity: disabled ? .5: 1,
        }}>
        <View>
          <TouchableOpacity disabled={disabled} 
            onPress={() => navigation.navigate("earnsSection", { section })}>
            <TextBlock />
            <View style={{position: "absolute", width: "100%"}}>
              <ProgressBar progress={progressSection} />
              <Icon style={styles.icon} width={50} height={50} />
              <Text style={styles.textStyleBox}>{text}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )}

  let sectionsComp = []

  sectionsData.forEach((item, index) => {
    sectionsComp.unshift(
    <BoxAdding  text={item.text}
                Icon={item.icon} 
                side={index % 2 ? "left":"right"} 
                position={index}
                section={item.index}
                length={sectionsData.length}
                />
  )})

  const scrollViewRef = React.createRef()

  React.useEffect(() => {
    scrollViewRef.current.scrollToEnd()
  }, [])

  const backgroundColor = currSection < sectionsData.length ? palette.sky : palette.orange

  React.useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      StatusBar.setBackgroundColor(color.transparent)
      StatusBar.setBarStyle("light-content")
      StatusBar.setTranslucent(true)
    });

    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation?.addListener('blur', () => {
      StatusBar.setTranslucent(false)
      StatusBar.setBarStyle("dark-content")
      StatusBar.setBackgroundColor(palette.lighterGrey)
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Screen unsafe={true} statusBar="light-content">
      <ScrollView 
        // removeClippedSubviews={true}
        style={{backgroundColor}}
        contentContainerStyle={{
          backgroundColor: palette.lightBlue, 
          flexGrow: 1,
        }}
        ref={scrollViewRef}
        onContentSizeChange={() => {
          scrollViewRef.current.scrollToEnd()
        }}>
        <MountainHeader amount={earned} color={backgroundColor} />
        {/* <View style={{backgroundColor: palette.sky}}>
          <Top width={screenWidth} />
        </View> */}
        <View style={styles.mainView}>
          <Finish currSection={currSection} length={sectionsData.length} />
          { sectionsComp }
          { currSection === 0 ?
              progress === 0 ?
                  <BottomStart />
                : <BottomOngoing /> 
              : <View style={{height: 40}} />
          }
        </View>
      </ScrollView>
    </Screen>
  )
}
