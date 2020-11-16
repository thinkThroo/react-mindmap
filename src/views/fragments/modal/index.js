import React from "react";
import { createProject } from "../../../services/dashboard";
import { connect } from 'react-redux';
import { updateProjectModalMW } from "../../../store/actions/project-modal";

import "./index.scss";

const handleChange = (e, updateProjectModalMW) => {
    console.log("this.props in handleChange func", e.target.name, e.target.value);
    e.persist();
    updateProjectModalMW({
        [e.target.name]: e.target.value
    });
}

function createProjectFn(workspace_id, title, description, projectType) {
    console.log(", title, description, projectType", title, description, projectType);
    // createProject(null, null, workspace_id).then(res => {
    //     if (res.msg.toLowerCase().includes("invalid token")) {
    //         // TODO: SHOW AN ALERT
    //     } else {
    //         this.props.history.push("/project/"+res._id+"/edit");
    //     }
    // })
}

const Modal = ({ isOpen, toggleCPModal, workspace_id, updateProjectModalMW, title, description, projectType }) => {
    return (
        <>
            {
                isOpen && <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={toggleCPModal}>&times;</span>
                        <div>Title:</div>
                        <input type="text" name="title" placeholder="enter project title" onChange={($e) => handleChange($e, updateProjectModalMW)} />
                        <div>Description:</div>
                        <input type="text" name="description" placeholder="enter project description" onChange={($e) => handleChange($e, updateProjectModalMW)} />
                        <div>Project Type:</div>
                        <div>
                            <input type="radio" id="tthroo-map" name="projectType" value="map" 
                                checked={projectType === "map"}  
                                onChange={($e) => handleChange($e, updateProjectModalMW)} 
                            />
                            <label for="map">Map</label>
                        </div>
                        <div>
                            <input type="radio" id="tthroo-map+analyse" name="projectType" value="map+analyse" 
                                checked={projectType === "map+analyse"}
                                onChange={($e) => handleChange($e, updateProjectModalMW)} 
                            />
                            <label for="map+analyse">Map + Analyse</label>
                        </div>
                        <div>
                            <input type="radio" id="tthroo-map+analyse+reminders" name="projectType" 
                                value="map+analyse+reminders" 
                                checked={projectType === "map+analyse+reminders"} 
                                onChange={($e) => handleChange($e, updateProjectModalMW)} />
                            <label for="map+analyse+reminders">Map + Analyse + Reminders</label>
                        </div>
                        <div>
                            <button onClick={() => createProjectFn(workspace_id, title, description, projectType)}>Save</button>
                            <button>Cancel</button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

// export default Modal;

const mapStateToProps = state => {
    // console.log("inside mapStateToPros func in container component: calendar-view::", state);
    return {
        title: state.projectModal.title,
        description: state.projectModal.description,
        projectType: state.projectModal.projectType
    }
}

export default connect(
    mapStateToProps,
    {
        updateProjectModalMW
    }
)(Modal);