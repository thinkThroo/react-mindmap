import lodash from "lodash";

const defaultState = {
    list: {},
    activeProjectId: null,
    interval: null
}

const projects = (state = defaultState, action) => {
    switch (action.type) {
        case "SET_ACTIVE_PROJECT":
            return {
                ...state,
                activeProjectId: action.id
            }
        case "ADD_PROJECT":
            let newState = { ...state };
            debugger
            if (action.tid == undefined) {
                // let newArray = newState.list.slice();
                // newArray.splice(action.id, 0, action.project);
                action.project._id = action._id;
                newState.list[action._id] = Object.assign({}, action.project);
                return newState;
            } else {
                // let newArray = newState.list[action.id].tasks.slice();
                // newArray.splice(newState.list[action.id].tasks.length, 0, action.project);
                // debugger
                newState.list[action._id].tasks[action.tid] = Object.assign({}, action.project);
                return newState;
            }
        case "UPDATE_PROJECT":
            let uState = { ...state };
            uState.list[action.id] = {
                ...uState.list[action.id],
                [action.key]: action.val
            };
            if (action.interval) {
                uState.list[action.id] = {
                    ...uState.list[action.id],
                    interval: action.interval
                };
            }
            if (Boolean(action.id))
                return uState;
            else
                return state;
        case "UPDATE_PROJECT_TASK":
            let utState = { ...state };
            debugger
            let {
                tid
            } = action;
            // tid = tid > 1 ? tid-1 : 0;
            utState.list[action.id].tasks[tid] = {
                ...utState.list[action.id].tasks[tid],
                [action.key]: action.val
            };
            if (action.interval) {
                utState.list[action.id].tasks[tid] = {
                    ...utState.list[action.id].tasks[tid],
                    interval: action.interval
                };
            }
            // debugger
            if (action.id != null)
                return utState;
            else
                return state;
        case "DEL_PROJECT":
            let dState = {...state};
            debugger
            delete dState.list[action.id]; // TODO: test
            return dState;
        case "CLEAR_STs":
            let cState = Object.assign({}, state);
            cState.list[action.id].tasks = {};
            return cState;
        case "SET_PROJECTS":
            let spState = lodash.cloneDeep(state);
            spState.list = action.list;
            return spState;
        default:
            return state;
    }
}

export default projects;