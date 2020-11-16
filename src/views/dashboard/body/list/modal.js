import React, { Component } from "react";
import { createProject } from "../../../../services/dashboard";
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Checkbox from "../../../fragments/checkbox/index";

import "./modal.scss";

class ProjectModal extends Component {

    state = {
        title: "",
        description: "",
        projectType: "map",
        checkedTypes: new Map(),
        projectTypes: [{
            name: 'roadmap',
            key: 'roadmap',
            label: 'Roadmap',
          },
          {
            name: 'map',
            key: 'map',
            label: 'Mindmap',
          },
          {
            name: 'analyse',
            key: 'analyse',
            label: 'Analyse',
          },
          {
            name: 'reminders',
            key: 'reminders',
            label: 'Reminders',
          }]
    }

    handleInpChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    getProjectType = () => {

        const {
            checkedTypes,
            projectTypes
        } = this.state;

        let pt = "map";

        projectTypes.forEach(t => {
            if(checkedTypes.get(t.name) && t.name !== "map") {
                pt = pt + "+" + t.name;
            }
        });

        return pt;
    }

    createProject = () => {
        console.log("this.state", this.state);
        let projectType = this.getProjectType();
        const {
            title,
            description
        } = this.state;
        let payload = {
            title: {
                quillText: title
            },
            description: {
                quillText: description
            },
            projectType
        }
        createProject(payload, this.props.match.params.workspace_id).then(res => {
            let data = { ...res };
            delete data.status;
            delete data.statusCode;
            let proj = {
                [res._id]: {
                    ...data,
                    _id: res._id
                }
            }
            console.log("project has been created successfuly, need to update the store now", proj);
            this.props.toggleProject(true, proj);
        })
            .catch(e => {
                console.log("e::", e);
                if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                    this.props.history.push("/");
                }
            });
    }


    handleChange = (e) => {
        e.persist();
        console.log("this.props in handleChange func", e.target.name, e.target.checked, this.state);
        const item = e.target.name;
        const isChecked = e.target.checked;
        this.setState(prevState => ({ checkedTypes: prevState.checkedTypes.set(item, isChecked) }));
    }

    render() {

        const {
            toggleProject
        } = this.props;

        const {
            title,
            description,
            projectType,
            projectTypes,
            checkedTypes
        } = this.state

        return (
            <div id="myModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <span class="close" onClick={toggleProject}>&times;</span>
                        <h2>Create project</h2>
                    </div>
                    <div class="modal-body">
                        <div>Title:</div>
                        <input type="text" name="title" placeholder="Enter Project Title..."
                            onChange={this.handleInpChange}
                        />
                        <div>Description:</div>
                        <textarea name="description" placeholder="Enter description...(optional)"
                            onChange={this.handleInpChange}></textarea>
                        {/* <div onChange={($e) => this.handleChange($e)}>Project Type: (select the following to include them in your project)
                        <div>
                                <input type="checkbox" id="tthroo-map" value="roadmap"
                                    // checked={projectType === "roadmap"}
                                />
                                <label for="map">Roadmap</label>
                            </div>
                            <div>
                                <input type="checkbox" id="tthroo-map" value="map"
                                    defaultChecked
                                    // checked={projectType === "map"}
                                />
                                <label for="map">Mindmap</label>
                            </div>
                            <div>
                                <input type="checkbox" id="tthroo-map+analyse" value="analyse"
                                    // checked={projectType === "analyse"}
                                />
                                <label for="analyse">Notes</label>
                            </div>
                            <div>
                                <input type="checkbox" id="tthroo-map+reminders"
                                    value="reminders"
                                    // checked={projectType === "reminders"}
                                />
                                <label for="reminders">Reminders</label>
                            </div>
                        </div> */}
                        {
                            projectTypes.map(item => (
                                <label key={item.key}>
                                {item.name}
                                <Checkbox name={item.name} checked={checkedTypes.get(item.name)} onChange={this.handleChange} />
                                </label>
                            ))
                        }
                    </div>
                    <div class="modal-footer">
                        <button onClick={this.createProject}>
                            Create
                        </button>
                        <button onClick={toggleProject}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(connect(null, {})(ProjectModal));