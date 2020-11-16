const events = (state = [], action) => {
    switch (action.type) {
        case 'UPDATE_EVENTS':
            // console.log("action:", action);
            return [
                ...state,
                ...action.events
            ]
        case 'ADD_EVENT':
            // console.log("inside ADD_EVENT state:", state);
            return [
                ...state,
                ...[action.event]
            ]
        default:
            return state
    }
}

export default events