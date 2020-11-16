let initState = {
    nto: [],
    dtCount: 0,
    date: new Date()
}

const notes = (state = initState, action) => {
    switch (action.type) {
        case 'GET_NAV_OPT':
            return {
                ...state,
                nto: [...action.tlOptions]
            }
        case 'UPDATE_DT_COUNT':
            return {
                ...state,
                dtCount: action.value === 0 ? action.value : state.dtCount + action.value
            }
        case 'UPDATE_DT':
            return {
                ...state,
                date: action.date
            }
        default:
            return state
    }
}

export default notes