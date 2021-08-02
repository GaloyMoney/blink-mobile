import { cleanup, fireEvent, render } from '@testing-library/react-native/pure'
import { SendBitcoinScreen } from "../../app/screens/send-bitcoin-screen"
// import { NavigationContainer } from '@react-navigation/native'

// import { MoveMoneyNavigator } from "../../app/navigation/index"


afterEach(cleanup);

it('SendBitcoinScreen', () => {

    const { getAllByA11yLabel, getByText } = render(<SendBitcoinScreen />)
})
