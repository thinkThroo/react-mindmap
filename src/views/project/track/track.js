import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { connect } from 'react-redux';
import { setStatusMW } from "../../../store/actions/status";
import { withRouter } from "react-router-dom";
import { setActiveProjectMW, updateProjectTask, updateProject, updateProjectMW } from "../../../store/actions/projects";
import EditComponent from "../edit/edit";
import LabelDD from "../../fragments/edit-dropdowns/label-dd";
import { createProject } from "../../../services/dashboard"
import { createKey } from "../map/packages/core/lib/main";

// fake data generator
// const getItems = (count, offset = 0) =>
//   Array.from({ length: count }, (v, k) => k).map(k => ({
//     id: `item-${k + offset}-${new Date().getTime()}`,
//     content: `item ${k + offset}`
//   }));

// filter based on status param
const getItems = (status, tasks) => {
    debugger;
    if (tasks != null) {
        let projects = Object.keys(tasks);
        if (projects && projects.length !== 0) {
            return projects.filter((p, i) => {
                let proj = tasks[p];
                if (status.toLowerCase() === proj.status.toLowerCase()) {
                    return proj;
                } else {
                    return null;
                }
            }).map((pr, i) => {
                let proj = tasks[pr];
                debugger;
                return {
                    id: `${proj._id}`,
                    content: `${proj.title.quillText}`,
                    topicKey: `${proj.title.topicKey}`,
                    parentKey: `${proj.title.parentKey}`
                }
            })
        }
    }
}

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};
const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    // margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "white",

    // styles we need to apply on draggables
    ...draggableStyle
});
const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "lightblue" : "white",
});
// TODO: SPLIT THIS CODE INTO MODULES, SEEMS NOT SO READABLE
function TrackComponent(props) {

    const { statuses, projects, activeProjectId, updateProjectMW, activeProjectTasksCount, isSidebarOpen } = props;

    debugger;

    const [projectsLength, setProjectsLength] = useState(0);

    const [state, setState] = useState([]);

    const [tid, setTid] = useState(null);

    const [toggleProjectModal, setToggleProjectModal] = useState(false);

    const [toggleStatusModal, setToggleStatusModal] = useState(false);

    const [topicKey, setTopicKey] = useState("");

    const [parentKey, setParentKey] = useState("");

    const [status, setStatus] = useState("");

    const updateSubtask = (tid, topicKey, parentKey) => {
        // console.log("inside updateSubtask, tid:", tid, "topicKey", topicKey );
        // console.log("this function set topicKey so it can be used in edit.js component modal to update nodes content");
        setTopicKey(topicKey);
        setParentKey(parentKey);
        setTid(tid);
        setToggleProjectModal(!toggleProjectModal);
        setProjectsLength(projectsLength + 1); // TODO: check wy edit has to increment projectsLength count?
    }

    const toggleEditModal = (item, status) => {
        // console.log("about to open modal, item:", item, "status:", status);
        setStatus(status);
        let tid;
        debugger
        let {
            map
        } = projects[activeProjectId];
        // console.log("once the project is created, it should be added to map.topics array, the following proces does that");
        // get parent-root node from map.topics
        let rootNode = map.topics.filter(rt => {
            if ( rt.parentKey == null) {
                return rt;
            }
        });
        // eslint-disable-next-line
        if (item == undefined) {
            // console.log("item is undefefined meaning that new item button is clicked-->about to create a project that returns task id");
            // tid = projects[activeProjectId].tasks.length;
            createProject().then(res => {
                // console.log("project has been created and res:", res);
                debugger
                tid = res._id;
                // console.log("found the root node, to push to subtopics");
                // node does not exist in map phase, create a new node by 
                // 1. creating a key using createKey and 
                let nKey = createKey();
                // 2. pushing it to the parent node's sub keys
                rootNode[0].subKeys.push(nKey);
                // 3. push it into map.topics array
                map.topics.push({
                    key: nKey,
                    blocks: [{ type: "CONTENT", data: "" }],
                    task_id: tid,
                    parentKey: rootNode[0].key
                });
                // console.log("updayted map object with created task being pushed as subtopic-map:", map);
                // console.log("calling updateProject mw to update map object");
                updateProject({
                    id: activeProjectId,
                    key: "map",
                    val: map
                });
                // console.log("finished with dispatching map update from track.js file, now about to call updateSubtask");
                updateSubtask(tid, nKey, rootNode[0].key);
            })
            .catch(e => {
                console.log("e::", e);
                if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                    this.props.history.push("/");
                }
            });
        } else {
            // console.log("item already exists, about to edit existin one")
            tid = item.id;
            // console.log("about to call udpateSubtask:");
            // console.log("THIS IS WHERE MAP.TOPICS ARRAY NODE SHOULD BE UPDATED? WHAT IS GOING ON WITH THIS?");
            updateSubtask(tid, item.topicKey, rootNode[0].key);
        }
    }

    const showStatusModal = () => {
        setToggleStatusModal(!toggleStatusModal);
    }

    function onDragEnd(result) {
        const { source, destination, draggableId } = result;
        debugger
        // dropped outside the list
        if (!destination) {
            return;
        }
        const sInd = +source.droppableId;
        const dInd = +destination.droppableId;

        if (sInd === dInd) {
            const items = reorder(state[sInd], source.index, destination.index);
            const newState = [...state];
            newState[sInd] = items;
            setState(newState);
        } else {
            const result = move(state[sInd], state[dInd], source, destination);
            const newState = [...state];
            newState[sInd] = result[sInd];
            newState[dInd] = result[dInd];
            setState(newState);
            // console.log("drag has ended, tid::", draggableId, "about to update status disptach");
            // setState(newState.filter(group => group.length)); // this removes extra status, which we don't want
            // updateProjectTask({ id: activeProjectId, tid: draggableId, key: "status", val: statuses[dInd].label });
            updateProjectMW({ id: activeProjectId, tid: draggableId, key: "status", val: statuses[dInd].label });
            // console.log("why is project length increasing altho there is only drag and drop occurred without any new nodes being created");
            setProjectsLength(projectsLength + 1);
        }
    }

    useEffect(() => {
        // get params
        const { id } = props.match.params;
        props.setActiveProjectMW(id);
        let initState = statuses.map(status => getItems(status.label, projects[id].tasks));
        debugger
        setState(initState);
        // eslint-disable-next-line
    }, [projectsLength, statuses.length, activeProjectTasksCount]);

    return (
        <div className={toggleProjectModal || toggleStatusModal ? "dv modal-bg" : (isSidebarOpen ? "dv" : "dv toggle")}>
            <div className={toggleProjectModal || toggleStatusModal ? "track-container modal-bg" : "track-container"}>
                {activeProjectId &&
                    <h1>
                        {projects[activeProjectId].title.quillText}
                    </h1>
                }
                <div className="tc-dnd-container">
                    <DragDropContext onDragEnd={onDragEnd}>
                        {state.map((el, ind) => (
                            <div className="ddc">
                                <div className="status-lbl">{statuses[ind].label}</div>
                                <button
                                    type="button"
                                    className={toggleProjectModal || toggleStatusModal ? "modal-bg add-i" : "add-i"}
                                    onClick={() => {
                                        toggleEditModal(null, statuses[ind].label)
                                    }}>
                                    Add new item
                                </button>
                                <Droppable key={ind} droppableId={`${ind}`}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            style={getListStyle(snapshot.isDraggingOver)}
                                            {...provided.droppableProps}
                                            className={toggleProjectModal || toggleStatusModal ? "drop-column modal-bg" : "drop-column"}
                                        >
                                            {el && el.length > 0 && el.map((item, index) => (
                                                <Draggable
                                                    key={item.id}
                                                    draggableId={item.id}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            className={"dnd-item"}
                                                            onClick={() => toggleEditModal(item)}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={getItemStyle(
                                                                snapshot.isDragging,
                                                                provided.draggableProps.style
                                                            )}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-around"
                                                                }}
                                                            >
                                                                {item.content}
                                                                {/* <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newState = [...state];
                                                                        newState[ind].splice(index, 1);
                                                                        setState(
                                                                            newState.filter(group => group.length)
                                                                        );
                                                                    }}
                                                                >
                                                                    delete
                                </button> */}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </DragDropContext>
                    <div className="ddc">
                        {/* <div className="status-lbl new">Add Status</div> */}
                        {/* <div className={toggleProjectModal ? "drop-column modal-bg" : "drop-column"}> */}
                        <button
                            type="button"
                            className={toggleProjectModal || toggleStatusModal ? "modal-bg add-s" : "add-s"}
                            onClick={() => {
                                // debugger
                                // setState([...state, []]);
                                showStatusModal()
                            }}>
                            Add new group
                            </button>
                        {/* </div> */}
                    </div>
                </div>
                {
                    toggleProjectModal &&
                    <EditComponent
                        mode="track"
                        activeProjectId={activeProjectId}
                        tid={tid}
                        topicKey={topicKey}
                        parentKey={parentKey}
                        toggleEditModal={toggleEditModal}
                        status={status}
                    />
                }
                {
                    toggleStatusModal &&
                    <LabelDD
                        mode="status"
                        onlyInput={true}
                        onlyModal={true}
                        modalView={toggleStatusModal}
                        modalClickHandler={showStatusModal}
                        activeProjectId={activeProjectId}
                        tid={tid}
                        value={null}
                    />
                }
            </div>
        </div>
    );
}

const mapStateToProps = state => {
    debugger
    return {
        statuses: state.sideBar.status.data,
        activeProjectId: state.projects.activeProjectId,
        projects: state.projects.list,
        activeProjectTasksCount: state.projects.list[state.projects.activeProjectId].tasksCount
    }
}

export default withRouter(connect(
    mapStateToProps,
    {
        setStatusMW,
        setActiveProjectMW,
        updateProjectTask,
        updateProjectMW,
        updateProject
    }
)(TrackComponent));
