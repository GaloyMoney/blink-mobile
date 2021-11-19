module.exports = {
  client: {
    includes: ["app/**/*.{ts,tsx,js,jsx,graphql}"],
    service: {
      name: `galoy`,
      url: `https://api.mainnet.bitcoinjungle.app/graphql`,
    },
  },
}
