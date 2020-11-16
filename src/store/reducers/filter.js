const filter = (state = {value: "calendar"}, action) => {
    switch (action.type) {
        case 'APPLY_FILTER':
            return {
                ...state,
                value: action.filter
            }
        default:
            return state
    }
}

export default filter;