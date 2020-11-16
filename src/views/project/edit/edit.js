import React, { Component } from "react";
import LabelDD from "../../fragments/edit-dropdowns/label-dd";
import * as Datetime from 'react-datetime';
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { setActiveProjectMW, updateProjectMW, addProjectMW } from "../../../store/actions/projects";
import Quill from "quill";
import ProjectModel from "../../../models/index";
import { getDuration } from "../../../services/analyse";
// import { updateProjectService } from "../../../services/project";
import { createProject } from "../../../services/dashboard";
// import cloneDeep from "clone-deep";
import lodash from "lodash";
import Select from "../../fragments/select";

import "./index.scss";
import "react-datetime/css/react-datetime.css";
import "quill/dist/quill.bubble.css";
import "../common/layout.scss";

class EditComponent extends Component {

    constructor (props) {
        super(props);

        this.state = {
            modalView: false,
            duration: "",
            activeProject: {}
        }

        this.saveContent = this.saveContent.bind(this);
        this.editorContainerIds = ["title", "description", "outcome", "reward"];
        this.toggleModal = this.toggleModal.bind(this);
        this.ws = null;
        this.meta = {};
    }

    toggleModal(e) {
        // e.stopPropagation();
        this.setState({ modalView: !this.state.modalView });
    }

    getDeepClonedObj = (obj) => {
        let clonedObj = lodash.cloneDeep(obj);
        // console.log("CLONEDOBJ::::", clonedObj);
        return clonedObj;
    } 

    saveContent(item, currentContent, tid, topicKey, parentKey) {
        currentContent.topicKey = topicKey;
        currentContent.parentKey = parentKey;
        debugger
        this.props.updateProjectMW({
            id: this.props.match.params.id,
            tid,
            key: item,
            val: Object.assign({}, currentContent)
            // val: this.getDeepClonedObj(currentContent)
        });
    }

    initializeProjEditor(initContent) {
        // quilljs initialization
        let Delta = Quill.import('delta');
        this.editorContainerIds.forEach(item => {
            let quill = new Quill('#' + item, {
                modules: {
                    toolbar: item.toolbar
                },
                scrollingContainer: '#scrolling-container',
                placeholder: this.meta[item].placeholder,
                theme: 'bubble'
            });
            let nItem = this.meta[item];
            nItem.quill = quill;
            if (initContent) {
                let content = { ...this.meta[item].quillContent };
                this.meta[item].quill.setContents(content, 'api');
                if (this.meta[item].quillText.length >= 0) {
                    this.meta[item].quill.setText(this.meta[item].quillText);
                }
            }
            // register text cchange listener
            this.meta[item].quill.on('text-change', (delta) => {
                let change = new Delta();
                let eItem = { ...this.meta[item] };
                eItem.change = change.compose(delta);
                let currentContent = this.meta[item];
                currentContent.quillContent = currentContent.quill.getContents();
                currentContent.quillText = currentContent.quill.getText();
                eItem.change = new Delta();
            });
        });

        this.setState({
            activeProject: this.meta
        });
    }

    calcDuration(activeProject) {
        this.setState({ duration: getDuration(new Date(activeProject.startTime), new Date(activeProject.endTime)).val });
    }

    componentDidMount() {

        const {
            topic
        } = this.props;

        console.log("topic in edit.js componentDidMount function{}::**", topic);

        // get params
        const { id } = this.props.match.params;
        
        let project = {};

        if (topic && topic.properties) {
            // bind the topic.blocks[0].data label with title.quillText
            topic.properties.title.quillText = topic.blocks[0].data;
            project = topic.properties;
        } else {
            project = {};
        }

        if (Boolean(project && project.title)) {
            this.meta = {};
            let projModelInstance = new ProjectModel(project);
            this.meta = projModelInstance.project;
            this.initializeProjEditor(true);
            this.calcDuration(this.meta);
        } else {
            this.meta = {};
            let newProject = {};
            newProject._id = id;
            const {
                status
            } = this.props;
            if (status)
                newProject.status = status;
            let projModelInstance = new ProjectModel(newProject);
            this.meta = projModelInstance.project;
            this.initializeProjEditor(false);
            this.calcDuration(this.meta);
            // if the new item is added, 
            // create a key, push it to the root node in map array
        }
    }

    componentWillUnmount() {
        this.editorContainerIds.forEach(item => {
            if (this.meta[item] && this.meta[item].quill) {
                this.meta[item].quill.off('text-change', (delta) => {
                    // console.log("inside unmount")
                });
            }
        });
        clearInterval(this.timer);
    }

    createProject = () => {
        console.log("this.meta", this.meta);
        // updateProjectService(lodash.cloneDeep(this.meta));
        createProject(this.meta, null, this.props.match.params.workspace_id).then(res => {
            console.log("succesfully created project", res);
            this.props.addProjectMW(res._id, null, this.meta);
            this.props.toggleEditModal();
        })
        .catch(e => {
            console.log("e::", e);
            if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                this.props.history.push("/");
            }
        });
    }

    handleProjectTypeChange = (e) => {
        // this.setState({
        //     tech: e.target.value
        // })
        this.meta.projectType = e.target.value;
    }

    render() {

        const {
            modalView,
            duration,
            activeProject
        } = this.state;

        const {
            meta,
            activeProjectId,
            tid,
            mode,
            toggleEditModal,
            status,
            isSidebarOpen,
            topic,
            updateProperties
        } = this.props;

        // let activeProject = {};
        // debugger
        // if (tid == undefined)
        //     activeProject = meta.list[activeProjectId];
        // else
        //     activeProject = meta.list[activeProjectId].tasks[tid];

        // console.log("activeProject in editjs file", modalView);

        return (
            <div className={mode === "track" ? "track-dv" : modalView ?  (isSidebarOpen ? "dv modal-bg" : "dv toggle") : (isSidebarOpen ? "dv" : "dv toggle")}>
                {/* className={isSidebarOpen ? "dv" : "dv toggle"} */}
                <div className={modalView ? "modal-bg edit-content" : "edit-content"}>
                    {
                        mode === "track" && <img
                            className="i-close edit-close"
                            src="/assets/web/tthroo-close-icon.svg"
                            onClick={toggleEditModal}
                            alt="close-icon" />
                    }
                    <div className="dv-hdr">
                        Project Details
                        </div>
                    <div className="e-c-items">
                        <div className="item title-c">
                            <div className="lbl">
                                Title
                                </div>
                            <div id="scrolling-container">
                                <div id="title"></div>
                                {/* <input name="title" type="text"
                                        value={title}
                                        onChange={this.handleTextInp}
                                    /> */}
                            </div>
                        </div>
                        <div className="item label">
                            <div className="lbl">
                                Status
                                </div>
                            {/* <StatusDD 
                                    onlyInput={true}
                                    modalView={modalView}
                                    modalClickHandler={modalClickHandler}
                                /> */}
                            <LabelDD
                                mode="status"
                                onlyInput={true}
                                modalView={modalView}
                                modalClickHandler={this.toggleModal}
                                activeProjectId={activeProjectId}
                                tid={tid}
                                value={status ? status : (activeProject && activeProject.status ? activeProject.status : null)}
                            />
                        </div>
                        <div className="item label">
                            <div className="lbl">
                                Label
                                </div>
                            <LabelDD
                                mode="label"
                                onlyInput={true}
                                modalView={modalView}
                                modalClickHandler={this.toggleModal}
                                activeProjectId={activeProjectId}
                                tid={tid}
                                value={activeProject && activeProject.label ? activeProject.label : null}
                            />
                        </div>
                        <div className="item">
                            <div className="lbl">
                                Project Type
                            </div>  
                            <div>
                                <Select 
                                    handleProjectTypeChange={this.handleProjectTypeChange}
                                    projectType={this.meta.projectType}
                                />
                            </div>
                        </div>
                        <div className="item">
                            <div className="lbl">
                                Start Time
                                </div>
                            <div>
                                {/* <input type="text" /> */}
                                <Datetime
                                    viewMode="time"
                                    timeFormat={true}
                                    value={activeProject ? activeProject.startTime : null}
                                    inputProps={{ placeholder: "Enter start time", readOnly: true, className: modalView ? "modal-bg" : "" }}
                                    disabled={modalView}
                                    onChange={(value) => {
                                        this.props.updateProjectMW({ id: this.props.id, tid, key: "startTime", val: value.toDate() });
                                        this.calcDuration({ ...activeProject, startTime: value.toDate() });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="item">
                            <div className="lbl">
                                End Time
                                </div>
                            <div>
                                {/* <input type="text" /> */}
                                <Datetime
                                    viewMode="time"
                                    value={activeProject ? activeProject.endTime : null}
                                    inputProps={{ placeholder: "Enter end time", readOnly: true, className: modalView ? "modal-bg" : "" }}
                                    className={modalView ? "modal-bg" : ""}
                                    disabled={modalView}
                                    onChange={(value) => {
                                        this.props.updateProjectMW({ id: this.props.id, tid, key: "endTime", val: value.toDate() });
                                        this.calcDuration({ ...activeProject, endTime: value.toDate() });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="item">
                            <div className="lbl">
                                Duration
                                </div>
                            <div>
                                <input className={modalView ? "modal-bg" : ""} type="text" value={duration ? duration : 0} readOnly={true} />
                            </div>
                        </div>
                        <div className="item description-c">
                            <div className="lbl">
                                Description
                                </div>
                            <div>
                                {/* <textarea name="description" 
                                        value={description}
                                        onChange={this.handleTextInp}    
                                    >
                                    </textarea> */}
                                <div id="scrolling-container">
                                    <div id="description"></div>
                                    {/* <input name="title" type="text"
                                            value={title}
                                            onChange={this.handleTextInp}
                                        /> */}
                                </div>
                            </div>
                        </div>
                        <div className="item outcome-c">
                            <div className="lbl">
                                Outcome
                                </div>
                            <div>
                                {/* <textarea name="outcome" 
                                        value={outcome}
                                        onChange={this.handleTextInp}
                                    >
                                    </textarea> */}
                                <div id="scrolling-container">
                                    <div id="outcome"></div>
                                    {/* <input name="title" type="text"
                                            value={title}
                                            onChange={this.handleTextInp}
                                        /> */}
                                </div>
                            </div>
                        </div>
                        <div className="item reward-c">
                            <div className="lbl">
                                Treat Yourself With
                                </div>
                            <div>
                                {/* <textarea name="reward" value={reward}
                                        onChange={this.handleTextInp}
                                    >
                                    </textarea> */}
                                <div id="scrolling-container">
                                    <div id="reward"></div>
                                    {/* <input name="title" type="text"
                                            value={title}
                                            onChange={this.handleTextInp}
                                        /> */}
                                </div>
                            </div>
                        </div>
                        <div className="item ctas">
                            { 
                                topic == null || Object.keys(topic).length == 0  ?
                                <button className="c-p-btn create" onClick={this.createProject}>Create</button> :
                                <button className="c-p-btn create" onClick={() => updateProperties(topic, this.meta)}>Update</button>
                            }
                            <button className="c-p-btn cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    // console.log("state:::", state);
    return {
        id: state.projects.activeProjectId,
        meta: state.projects,
        activeProjectId: state.projects.activeProjectId
    }
}

export default withRouter(connect(
    mapStateToProps,
    {
        updateProjectMW,
        setActiveProjectMW,
        addProjectMW
    }
)(EditComponent));