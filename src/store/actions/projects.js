// import { createKey } from "../../views/project/map/packages/core/lib/main";
import ProjectModel from "../../models/index";
import TitleModel from "../../models/title";
import { createProject } from "../../services/dashboard";
import { updateProjectService, deleteProjectService } from "../../services/project";
import lodash from "lodash";

export const addProject = (_id, tid, project) => ({
    type: 'ADD_PROJECT',
    _id,
    tid,
    project
});

export const addProjectMW = (id, tid, project) => (dispatch) => {
    dispatch(addProject(id, tid, project));
}


export const delProject = (id, workspace_id) => ({
    type: 'DEL_PROJECT',
    id,
    workspace_id
});

export const delProjectMW = (id, workspace_id) => (dispatch) => {
    deleteProjectService(id, workspace_id).then((res) => {
        // console.log("about to delete from redux, successfully removed deleted from backend", res);
        dispatch(delProject(id, workspace_id));
    })
    .catch(e => {
        console.log("e::", e);
        if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
            this.props.history.push("/");
        }
    });
}

export const clearSTs = (id) => ({
    type: 'CLEAR_STs',
    id
})

export const clearSubtasksMW = (id) => (dispatch) => {
    dispatch(clearSTs(id))
}

export const editProject = (index, meta) => ({
    type: 'EDIT_PROJECT',
    index,
    ...meta
});

export const editProjectMW = (index) => (dispatch) => {
    dispatch(editProject(index));
}

export const updateProject = (meta) => ({
    type: "UPDATE_PROJECT",
    ...meta
})

export const updateProjectTask = (meta) => ({
    type: "UPDATE_PROJECT_TASK",
    ...meta
})

const bindMapToTrack = () => (dispatch, getState) => {
    const {
        projects
    } = getState();
    let activeProjectId = projects.activeProjectId;
    let activeProject = projects.list[activeProjectId];
    debugger
    activeProject.map.topics.forEach((tp, i) => {
        if (tp.parentKey != null) {
            debugger
            // create a new project model with quillText being updated 
            if (tp.task_id == null) {
                let newProject = new TitleModel();
                // newProject.id = tkey;
                // newProject.title = {
                //     quill: null,
                //     quillText: tp.blocks[0].data,
                //     quillContent: {},
                //     value: "",
                //     toolbar: [[{ header: [1, 2, false] }],
                //     ['bold', 'italic', 'underline']],
                //     placeholder: "Enter Title"
                //     // quillContent: title.quill.setText(mmData.topics[index].blocks[0].data)
                // }
                debugger
                newProject.title.quillText = tp.blocks[0].data;
                newProject.title.topicKey = tp.key;
                newProject.title.parentKey = tp.parentKey;
                let projModelInstance = new ProjectModel(newProject);
                createProject(projModelInstance.project, activeProject._id).then(res => {
                    debugger
                    projModelInstance.project._id = res._id;
                    // add task_id to map topics item for later updates like saving to avoid redundant save calls
                    tp.task_id = res._id;
                    // call dispatching mw
                    dispatch(addProject(activeProjectId, res._id, projModelInstance.project));
                    // set a counter update which is used for updates in track phase
                    dispatch(updateProject({
                        id: activeProjectId,
                        key: "tasksCount",
                        val: projects.list[projects.activeProjectId].tasksCount + 1
                    }));
                })
                .catch(e => {
                    console.log("e::", e);
                    if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                        this.props.history.push("/");
                    }
                });
            } else {
                // handle updating here
                // console.log("this task already exists, so this should be updated::", tp);
                debugger;
                let taskProj = activeProject.tasks[tp.task_id];
                // get the active project title
                let title = taskProj.title;
                // update the title.quilltext
                title.quillText = tp.blocks[0].data;
                if (title.quill) {
                    title.quillContent = title.quill.setText(tp.blocks[0].data);
                }
                // call the mw to update the title
                dispatch(updateProjectTask({
                    id: activeProjectId,
                    tid: tp.task_id,
                    key: "title",
                    val: title
                }));
                // update the data 
                debugger;
                console.log("calling update service from bindMapToTrack function");
                updateProjectService(lodash.cloneDeep(projects.list[activeProjectId].tasks[tp.task_id]));
            }
        } else {
            // root node
            let taskProj = activeProject;
            // get the active project title
            let title = taskProj.title;
            // update the title.quilltext
            title.quillText = tp.blocks[0].data;
            if (title.quill) {
                title.quillContent = title.quill.setText(tp.blocks[0].data);
            }
            // call the mw to update the title
            dispatch(updateProject({
                id: activeProjectId,
                key: "title",
                val: title
            }));
            // update the data 
            debugger;
            console.log("calling update service from bindMapToTrack function, updating root nide title");
            updateProjectService(lodash.cloneDeep(projects.list[activeProjectId]))
        }
    });
    // update the map as well, since there has been an update to topics with created project id
    dispatch(updateProject({
        id: activeProjectId,
        key: "map",
        val: activeProject.map
    }));
}

const bindTrackToMap = (meta) => (dispatch, getState) => {
    // console.log("inside bindTrackToMap func", meta);
    // get map from state
    let {
        projects
    } = getState();
    let activeProjectId = projects.activeProjectId;
    let activeProject = projects.list[activeProjectId];
    let {
        map
    } = activeProject;
    // get the topicKey and parentKey of that sub task
    let tk = meta.val.topicKey;
    // console.log("get the topicKey from meta:", meta.val.topicKey, "what is this used for?");
    // console.log("tk:", tk, "is used to identify the node from map.topics based tk==topic.key logic");
    // check if tk is available in map topics array
    let filteredTopic = map.topics.filter(t => {
        if ( t.key == tk) {
            return t;
        }
    });
    // console.log("filtered topic/found node is:", filteredTopic);
    // get parent-root node from map.topics
    let rootNode = map.topics.filter(rt => {
        if ( rt.parentKey == null) {
            return rt;
        }
    });
    // console.log("found rootNode", rootNode);
    debugger;
    // if filteredTopic length is > 0; node already exists, just update the content
    if (filteredTopic.length > 0) {
        // console.log("dispatch is being performed on an existing node");
        filteredTopic[0].blocks[0].data = meta.val.quillText;
        // console.log("update node's blocks[0].data with text");
        map.topics.forEach((item) => {
            if (item.key == filteredTopic[0].key) {
                item.blocks[0].data = filteredTopic[0].blocks[0].data;
            }
        });
        // console.log("update the map object's topic with updated text from above and dispatch map to be saved");
        dispatch(updateProject({
            id: meta.id,
            key: "map",
            val: map
        }));
        console.log("calling update service from BINDTRACKTOMAP function");
        // update the map, this is important
        updateProjectService(lodash.cloneDeep(projects.list[activeProjectId]))
    } else {
        // console.log("no match found in map.topics array for tk:", tk);
        // console.log("THIS SHOULD NOT HAPPEN, SOMETHING IS WRONG---DEBUG FURTHER");
        // console.log(`why this should not happen?--because at the time of creating a node only we deal 
        // with creating new key and pushing it map.topics array`);
        // // node does not exist in map phase, create a new node by 
        // // 1. creating a key using createKey and 
        // let nKey = createKey();
        // // 2. pushing it to the parent node's sub keys
        // rootNode[0].subKeys.push(nKey);
        // // 3. push it into map.topics array
        // map.topics.push({
        //     key: nKey,
        //     blocks: [{ type: "CONTENT", data: meta.val.quillText }],
        //     task_id: meta.tid,
        //     parentKey: rootNode[0].key
        // });
        // dispatch(updateProject({
        //     id: meta.id,
        //     key: "map",
        //     val: map,
        //     topicKey: nKey,
        //     parentKey: rootNode[0].key
        // }));
    }
}

export const updateProjectMW = (meta) => (dispatch, getState) => {
    const {
        projects
    } = getState();
    // console.log("inside updateProjectM-meta:", meta);
    debugger
    if (meta.tid != undefined) {
        // console.log("updating the project-task, NOT PROJECT");
        dispatch(updateProjectTask(meta));
        // update the task
        console.log("calling update service from UPDATEPROJECMW, when meta.tid exists function-> it updates task");
        updateProjectService(lodash.cloneDeep(projects.list[meta.id].tasks[meta.tid]))
        if (meta.key == "title") {
            debugger;
            // console.log("since dispatch deals with updating project title, calling bindTrackToMap function");
            dispatch(bindTrackToMap(meta));
        }
        if (meta.key == "status") {
            let obj = {};
            obj.key = "timeTaken";
            if (meta.val.toLowerCase() == "done")
                obj.val = new Date();
            else
                obj.val = null;
            obj.id = meta.id;
            obj.tid = meta.tid;
            dispatch(updateProjectTask(obj));
            // update the data 
            // debugger;
            // console.log("calling update service from UPDATEPROJECMW, when meta.tid exists function --> this updates status--thinking this is not necessary");
            // updateProjectService(lodash.cloneDeep(projects.list[meta.id].tasks[meta.tid]))
        }
    } else {
        dispatch(updateProject(meta));
        if (meta.key == "status") {
            let obj = {};
            obj.key = "timeTaken";
            if (meta.val.toLowerCase() == "done")
                obj.val = new Date();
            else
                obj.val = null;
            obj.id = meta.id;
            dispatch(updateProject(obj));
        }

        if (meta.key === "map") {
            dispatch(bindMapToTrack());
        }
        // // update the data 
        // debugger
        // console.log("calling update service from UPDATEPROJECMW, when meta.tid Does not exist function --> this updates the actual project");
        // updateProjectService(lodash.cloneDeep(projects.list[meta.id]))
    }
}

export const setActiveProject = (id) => ({
    type: 'SET_ACTIVE_PROJECT',
    id
});

export const setActiveProjectMW = (id) => (dispatch) => {
    dispatch(setActiveProject(id));
}

export const setProjects = (meta) => ({
    type: "SET_PROJECTS",
    ...meta
})

export const setProjectsMW = (meta) => (dispatch) => {
    dispatch(setProjects(meta));
}