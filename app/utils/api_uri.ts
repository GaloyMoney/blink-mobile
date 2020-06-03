import { GRAPHQL_TESTNET_URI } from 'react-native-dotenv'
import { GRAPHQL_MAINNET_URI } from 'react-native-dotenv'
import { Token } from "./token"

export const getGraphQlUri = () => {
  const network = new Token().network()

  if (network === "testnet") { 
    return GRAPHQL_TESTNET_URI
  }
  else if (network === "mainnet") {
    return GRAPHQL_MAINNET_URI
  }
}