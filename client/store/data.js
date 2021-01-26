const SET_DATA = 'SET_DATA'

export const setData = data => {
  console.log('data', data)
  return {
    type: SET_DATA,
    data
  }
}

export default function dataReducer(state = {}, action) {
  console.log('action', action)
  switch (action.type) {
    case SET_DATA:
      return action.data
    default:
      return state
  }
}
