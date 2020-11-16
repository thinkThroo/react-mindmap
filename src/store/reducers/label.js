const defaultState = {
    activeLabel: "Work",
    data: [{
        label: "Work"
    }]
}

const label = (state = defaultState, action) => {
    switch (action.type) {
        case 'SET_LABEL':
            return {
                ...state,
                activeLabel: action.activeLabel
            }
        case 'ADD_LABEL':
            return {
                ...state,
                data: [...state.data, {label: action.label}]
            }
        case 'DELETE_LABEL':
                return {
                    ...state,
                    data: state.data.filter((item, i) => i != action.index)
                }
        default:
            return state
    }
}

export default label;