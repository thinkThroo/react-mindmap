import { ADD_WORKSPACE, SET_WORKSPACES, SET_ACTIVE_WS_PROJECT, DELETE_WORKSPACE } from "../action-types/workspace";

export const defaultState = {
    activeWSProject: {},
    workspaces: []
}

const wikis = (state = defaultState, action) => {
    const {
        workspaces
    } = state;
    switch (action.type) {
        case ADD_WORKSPACE:
            if (action.index == undefined) {
                action.index = workspaces.length;
            }
            return {
                ...state,
                workspaces: [
                    ...workspaces.slice(0, action.index),
                    action.workspace,
                    ...workspaces.slice(action.index)
                  ]
            }
        case SET_WORKSPACES:
            return {
                ...state,
                workspaces: action.workspaces
            }
        case SET_ACTIVE_WS_PROJECT:
            return {
                ...state,
                activeWSProject: {...action.activeWSProject}
            }
        case DELETE_WORKSPACE:
            let foundWs = workspaces.filter(ws => ws._id == action.index);
            let index;
            if (foundWs.length == 1) {
                index = workspaces.indexOf(foundWs[0]);
                console.log("FOUND INDEX::", index);
            }
            return {
                ...state,
                workspaces: [
                    ...workspaces.slice(0, index), 
                    ...workspaces.slice(index + 1)
                ]
            }
        default:
            return state
    }
}

export default wikis;