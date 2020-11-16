export const defaultState = {
    label: {
        active: "Work",
        data: [{
            label: "Work"
        }, {
            label: "TThroo"
        }]
    },
    status: {
        active: "Todo",
        data: [{
            label: "Todo"
        }, {
            label: "Doing"
        }, {
            label: "Done"
        }]
    },
    date: {
        activeDate: new Date()
    }
}

const sideBar = (state = defaultState, action) => {
    switch (action.type) {
        case 'SET_DATE':
            return {
                ...state,
                date: {...state.date, activeDate: action.activeDate}
            }
        case 'SET_STATUS':
            return {
                ...state,
                status: {...state.status, active: action.activeStatus}
            }
        case 'SET_LABEL':
            return {
                ...state,
                label: {...state.label, active: action.activeLabel}
            }
        case 'ADD_LABEL':
            return {
                ...state,
                label: {...state.label, data: [...state.label.data, {label: action.label}]}
            }
        case 'DELETE_LABEL':

            let nextActiveLbl;
                
            nextActiveLbl = action.index > 0 ? state.label.data[action.index-1] : state.label.data[action.index+1];

            // console.log("nextActive for LABEL", nextActiveLbl);

                return {
                    ...state,
                    label: {
                        ...state.label, 
                        data: state.label.data.filter((item, i) => i !== action.index),
                        active: nextActiveLbl && nextActiveLbl.label ? nextActiveLbl.label : null 
                    }   
                }
        case 'ADD_STATUS':
            return {
                ...state,
                status: {...state.status, data: [...state.status.data, {label: action.label}]}
            }
        case 'DELETE_STATUS':

                let nextActive;
                
                nextActive = action.index > 0 ? state.status.data[action.index-1] : state.status.data[action.index+1];

                // console.log("nextActive for status", nextActive);

                return {
                    ...state,
                    status: {
                        ...state.status, 
                        data: state.status.data.filter((item, i) => i !== action.index),
                        // active: nextActive && nextActive.label ? nextActive.label : null 
                    },
                }
        default:
            return state
    }
}

export default sideBar;