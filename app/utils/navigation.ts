// Gets the current screen from navigation state
export const getActiveRouteName = (state) => {
  // console.tron.log({state})

  const route = state.routes[state.index]

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state)
  }

  return route.name
}

// Gets the current screen from navigation state
export const getActiveRouteParams = (state) => {
  // console.tron.log({state})

  const route = state.routes[state.index]

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteParams(route.state)
  }

  return route.params
}
