import * as React from "react"
import { StyleSheet } from "react-native"
import { Screen } from "../../components/screen"
import BottomOngoing from "./bottom-ongoing-01.svg"
import BottomStart from "./bottom-start-01.svg"
import LeftLastComplete from "./left-finished-01.svg"
import LeftComplete from "./left-section-completed-01.svg"
import LeftOngoing from "./left-section-ongoing-01.svg"
import LeftTodo from "./left-section-to-do-01.svg"
import RightFirst from "./right-first-section-to-do-01.svg"
import RightLastTodo from "./right-last-section-to-do-01.svg"
import RightComplete from "./right-section-completed-01.svg"
import RightOngoing from "./right-section-ongoing-01.svg"
import RightTodo from "./right-section-to-do-01.svg"
import Top from "./top-01.svg"


const styles = StyleSheet.create({

})

type SideType = "left" | "right"
interface IInBetweenTile {
  side: SideType
  position: number
}

export const RewardsMapScreen = ({ navigation, currSection }) => {

  const InBetweenTile: React.FC<IInBetweenTile> = ({ side, position }) => {
    if (currSection < position) {
      return side === "left" ? <LeftTodo /> : <RightTodo />
    } else if (currSection === position) {
      return side === "left" ? <LeftOngoing /> : <RightOngoing />
    } else {
      return side === "left" ? <LeftComplete /> : <RightComplete />
    }
  }

  return (
    <Screen preset="scroll">
      
      <Top />
      { currSection === 10 ? <LeftLastComplete /> : null }
      { currSection < 9 ?
        <RightLastTodo />
          : currSection === 9 ?
              <RightOngoing />
            : <RightComplete />
      }
      <InBetweenTile side={"left"} position={8}/>
      <InBetweenTile side={"right"} position={7}/>
      <InBetweenTile side={"left"} position={6}/>
      <InBetweenTile side={"right"} position={5}/>
      <InBetweenTile side={"left"} position={4}/>
      <InBetweenTile side={"right"} position={3}/>
      <InBetweenTile side={"left"} position={2}/>
      { currSection === 0 ? <RightFirst />
        : currSection === 1 ?
            <RightOngoing />
          : <RightComplete />
        }
      { currSection === 0 ? <BottomStart /> : <BottomOngoing /> }
    </Screen>
  )
}
