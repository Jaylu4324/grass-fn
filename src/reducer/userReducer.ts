const intialState = {
    isLogin: false,
    userData: {

    }
}

const userReducer = (state = intialState, action:any) => {
    try {
        switch (action.type) {
            case "login": {
                return { ...state, userData: action.payload.userData, isLogin: true }
            }
            case "logout": {
                return { ...state, userData: {}, isLogin: false }
            }
            default: {
                return state
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export default userReducer