import { UPDATE_PROJECT_MODAL } from "../action-types/project-modal";

const defaultState = {
    title: "",
    description: "",
    projectType: "map"
}

const projectModal = (state = defaultState, action) => {
    switch (action.type) {
        case UPDATE_PROJECT_MODAL:
            return {
                ...state,
                ...action.meta
            }
        default:
            return state;
    }
}

export default projectModal;