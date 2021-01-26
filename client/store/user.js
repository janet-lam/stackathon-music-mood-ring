const SET_USER = 'SET_USER'

export const setUser = user => {
  console.log('user', user)
  return {type: SET_USER, user}
}

export default function userReducer(state = '', action) {
  switch (action.type) {
    case SET_USER:
      return action.user
    default:
      return state
  }
}
