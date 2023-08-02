module.exports = {
  client: {
    includes: ["app/**/*.{ts,tsx,js,jsx,graphql}"],
    service: {
      name: `galoy`,
      url: `http://100.116.189.124:4000/graphql`,
    },
  },
}
