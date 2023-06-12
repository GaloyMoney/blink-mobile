import { resolveGaloyInstanceOrDefault, GALOY_INSTANCES } from "@app/config"

it("get a full object with BBW", () => {
  const res = resolveGaloyInstanceOrDefault({ id: "Main" })

  expect(res).toBe(GALOY_INSTANCES[0])
})

it("get a full object with Staging", () => {
  const res = resolveGaloyInstanceOrDefault({ id: "Staging" })

  expect(res).toBe(GALOY_INSTANCES[1])
})

it("get a full object with Custom", () => {
  const CustomInstance = {
    id: "Custom",
    name: "Custom",
    graphqlUri: "https://api.custom.com/graphql",
    graphqlWsUri: "ws://ws.custom.com/graphql",
    posUrl: "https://pay.custom.com/",
    lnAddressHostname: "custom.com",
    blockExplorer: "https://mempool.space/tx/",
  } as const

  const res = resolveGaloyInstanceOrDefault(CustomInstance)

  expect(res).toBe(CustomInstance)
})
