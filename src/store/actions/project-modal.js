import { UPDATE_PROJECT_MODAL } from "../action-types/project-modal";

export const updateProjectModal = (meta) => ({
    type: UPDATE_PROJECT_MODAL,
    meta
});

export const updateProjectModalMW = (meta) => (dispatch) => {
    dispatch(updateProjectModal(meta));
}