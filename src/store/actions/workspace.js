import { createWiki, deleteWorkspaceService } from "../../services/workspace";
import {
    ADD_WORKSPACE,
    SET_WORKSPACES,
    SET_ACTIVE_WS_PROJECT,
    DELETE_WORKSPACE
} from "../action-types/workspace";

export const addWorkspace = (workspace, index) => ({
    type: ADD_WORKSPACE,
    workspace,
    index
});

export const addWorkspaceMW = (workspace, index) => (dispatch) => {
    return new Promise((resolve, reject) => {
        createWiki(workspace).then((res) => {
            console.log("res from createWiki", res);
            let obj = {
                name: workspace,
                _id: res._id,
                map: res.map ? res.map : {}
            }
            dispatch(addWorkspace(obj, index));
            resolve(res);
        })
            .catch(e => {
                console.log("e::", e);
                if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                    this.props.history.push("/");
                }
                reject(e);
            });
    });
}

export const setWorkspaces = (workspaces) => ({
    type: SET_WORKSPACES,
    workspaces
});

export const setWorkspacesMw = (workspaces) => (dispatch) => {
    dispatch(setWorkspaces(workspaces));
};

export const setActiveWSProject = (workspace) => ({
    type: SET_ACTIVE_WS_PROJECT,
    activeWSProject: workspace,
});

export const setActiveWSProjectMW = (workspace) => (dispatch) => {
    dispatch(setActiveWSProject(workspace))
}

export const deleteWorkspace = (workspace) => ({
    type: DELETE_WORKSPACE,
    index: workspace._id
});

export const deleteWorkspaceMw = (workspace) => (dispatch) => {

    return new Promise((resolve, reject) => {
        deleteWorkspaceService(workspace._id).then(res => {
            dispatch(deleteWorkspace(workspace));
            resolve(res);
        })
            .catch(e => {
                console.log("e::", e);
                if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                    this.props.history.push("/");
                }
                reject(e);
            });
        // dispatch(deleteWorkspace(workspace));
    })
};