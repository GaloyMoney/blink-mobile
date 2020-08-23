import { validPayment } from "../app/utils/parsing"
import moment from "moment"

// more test address can be found at: https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/fixtures/address.json

beforeAll(() => {
  moment.now = function () {
    return 1598110996000 // Aug 22 2020 10:43
  }
})

const checkOnChain = (address, network) => {
  const {valid, paymentType, errorMessage} = validPayment(address, network)
  console.log(errorMessage)
  expect(valid).toBeTruthy()
  expect(paymentType).toBe("onchain")
}

const checkOnChainFail = (address, network) => {
  const {valid, paymentType, errorMessage} = validPayment(address, network)
  console.log(errorMessage)
  expect(valid).toBeFalsy()
}


const p2pkh = "1KP2uzAZYoNF6U8BkMBRdivLNujwSjtAQV";
const p2sh = "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy";
const bech32 = "bc1qdx09anw82zhujxzzsn56mruv8qvd33czzy9apt";
const bech32_caps = "BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4";

const bech32_regtest = "bcrt1qam64av6cyhjsgdwajjpe0l9z8ju4w7rjryecf3";

const bech32_testnet = "tb1q0g444vcyy53pza03zsel3tcwdejt9z5kq3w385aqgazpfxjhsr0qhds7p5";


it('bitcoin address mainnet', () => {  
  const network = "mainnet"
  
  checkOnChain(p2pkh, network)
  checkOnChain(p2sh, network)
  checkOnChain(bech32, network)
  checkOnChain(bech32_caps, network)


  checkOnChainFail(bech32_regtest, network)
  checkOnChainFail(bech32_testnet, network)  
})

it('bitcoin address testnet', () => {  
  const network = "testnet"
  
  checkOnChain(bech32_testnet, network)

  checkOnChainFail(bech32_regtest, network)
  checkOnChainFail(bech32, network)  
})

it('bitcoin address regtest', () => {  
  const network = "regtest"
  
  checkOnChain(bech32_regtest, network)

  checkOnChainFail(p2pkh, network)
  checkOnChainFail(bech32_testnet, network)  
})

it('bitcoin lightning', () => {  
  const opennode_expired = "LNBC11245410N1P05Z2LTPP52W2GX57TZVLM09SWZ8M0CAWGQPVTL3KUWZA836H5LG6HK2N2PRYQDPHXYSV89EQYVMJQSNFW3PXCMMRDDZXJMNWV4EZQST4VA6HXAPQXGU8G6QCQZPGXQRRSSVS7S2WT4GX90MQC9CVMA8UYDSTX5P0FA68V03U96HQDPFCT9DGDQQSENNAAGAXND6664CTKV88GMQ689LS0J7FFAD4DRN6SPLXAXZ0CQYZAU9Q";
  const opennode = "LNBC6864270N1P05ZVJJPP5FPEHVLV3DD2R76065R9V0L3N8QV9MFWU9RYHVPJ5XSZ3P4HY734QDZHXYSV89EQYVMZQSNFW3PXCMMRDDPX7MMDYPP8YATWVD5ZQMMWYPQH2EM4WD6ZQVESYQ5YYUN4DE3KSGZ0DEK8J2GCQZPGXQRRSS6LQA5JLLVUGLW5TPSUG4S2TMT5C8FNERR95FUH8HTCSYX52CP3WZSWJ32XJ5GEWYFN7MG293V6JLA9CZ8ZNDHWDHCNNKUL2QKF6PJLSPJ2NL3J";

  const checkValidLightning = (address) => {
    const {valid, paymentType} = validPayment(address, "mainnet")
    expect(valid).toBeTruthy()
    expect(paymentType).toBe("lightning")
    // console.log(errorMessage)
  }

  const checkInvalidLightning = (address) => {
    const {valid, paymentType, errorMessage} = validPayment(address, "mainnet")
    expect(valid).toBeFalsy()
    expect(paymentType).toBe("lightning")
    expect(errorMessage).toBe("invoice has expired")
  }
  
  checkInvalidLightning(opennode_expired)
  checkValidLightning(opennode)
})