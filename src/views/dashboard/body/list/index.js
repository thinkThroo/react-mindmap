import React, { Component } from "react";
// import CircleProgressBar from "../../../fragments/circular-progress-bar/index";
import { connect } from 'react-redux';
// import { convertIsoToFormat } from "../../../../utils/date";
import { withRouter } from 'react-router-dom';
import { delProjectMW, setProjectsMW } from "../../../../store/actions/projects";
import { setActiveWSProjectMW } from "../../../../store/actions/workspace";
import { getProjects } from "../../../../services/dashboard";
// import activeProject from "store/reducers/edit-project";
import ProjectModal from "./modal";

import "./index.scss";

class ProjectsList extends Component {

    constructor (props) {
        super(props);
        this.hoverIn = this.hoverIn.bind(this);
        this.hoverOut = this.hoverOut.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.switchToProject = this.switchToProject.bind(this);
    }

    state = {
        showEditIcon: -1,
        showActionsDD: false,
        loading: false,
        toggleProjectModal: false
    }

    hoverIn(i) {
        console.log("i::", i)
        this.setState({ showEditIcon: i });
    }

    hoverOut(i) {
        this.setState({ showEditIcon: -1, showActionsDD: false });
    }

    toggleEdit(e) {
        e.stopPropagation();
        this.setState({ showActionsDD: !this.state.showActionsDD });
    }

    getProjProgress = (proj) => {
        // console.log("proj::", proj);
        // get the tasks length
        // get the done status project count
        // divide them and get percentage.
        if (proj.tasks && Object.keys(proj.tasks).length > 0) {
            let l = Object.keys(proj.tasks).length;
            let reducer = (accumulator, currentValue) => proj.tasks[currentValue].status && proj.tasks[currentValue].status.toLowerCase() === "done" ? accumulator + 1 : accumulator;
            let dl = Object.keys(proj.tasks).reduce(reducer, 0);
            return Math.ceil((dl / l) * 100);
        } else {
            return proj.status.toLowerCase() === "done" ? 100 : 0;
        }
    }

    switchToProject(index, fromEdit, e, item) {
        if (Boolean(fromEdit)) {
            e.stopPropagation();
        }
        // console.log("this.props in swithcToProject", this.props, "index", index, "this.props.histroy.push", this.props.history.push);
        this.props.setActiveWSProjectMW(item);
        this.props.history.push(`/workspace/${this.props.match.params.workspace_id}/project/${index}/edit`);
    }

    deleteProject = (index, e) => {
        debugger
        e.stopPropagation();
        this.props.delProjectMW(index, this.props.match.params.workspace_id);
        this.setState({ showEditIcon: -1, showActionsDD: false });
    }

    toggleProject = (onCreate, updatedList) => {

        const {
            projects
        } = this.props;

        this.setState({
            toggleProjectModal: !this.state.toggleProjectModal
        });
        if (onCreate) {
            console.log("this.projects", projects);
            this.props.setProjectsMW({list: {...projects, ...updatedList}});
        }
    }

    componentDidMount() {
        getProjects(this.props.match.params.workspace_id).then(res => {
            // console.log("res from get project list api-hide loader-set store with the latest list", res);
            this.setState({ loading: false });
            let list = {};
            if (res.list && res.list.length > 0) {
                res.list.forEach(element => {
                    list[element._id] = element;
                });
            }
            this.props.setProjectsMW({list});
            let wsMeta = {};
            if (res.workspace && res.workspace.length > 0) {
                wsMeta = res.workspace[0];
            }
            this.props.setActiveWSProjectMW({
                ...wsMeta
            });
        })
        .catch(e => {
            console.log("e::", e);
            if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                this.props.history.push("/");
            }
        });
    }

    getActiveProjects = () => {

        const {
            projects
        } = this.props;

        let keys = Object.keys(projects ? projects : {}), activeProjects = [];

        // eslint-disable-next-line
        if (keys.length > 0) {
            activeProjects = keys.map(item => projects[item]);
        }

        return activeProjects;
    }

    render() {

        const {
            showEditIcon,
            showActionsDD,
            loading,
            toggleProjectModal
        } = this.state;

        const {
            activeWSProject
        } = this.props;

        let activeProjects = this.getActiveProjects();

        return (
            <>
            <div className="ls-h">
                <h1 className="tthroo-p">
                    {activeWSProject && activeWSProject.name}/Projects
                </h1>
                <button className="cp" onClick={this.toggleProject}>Create Project</button>
            </div>
            <div className="ls">
                {loading ?
                    <div>Loading</div> :
                    <>
                        <div className="p-c">
                            {
                                Object.keys(activeProjects).length > 0 ?
                                    activeProjects.map((item, index) => <div className="ls-data"
                                        onMouseEnter={() => this.hoverIn(item._id)}
                                        onMouseLeave={() => this.hoverOut(item._id)}
                                        onClick={() => this.switchToProject(item._id, null, null, item)}
                                    >
                                        {
                                            showEditIcon === item._id &&
                                            <div className="edit-dd">
                                                <img className="dropdown" src="/assets/web/tthroo-dropdown.svg" onClick={this.toggleEdit} alt="dropdown-icon" />
                                                {
                                                    showActionsDD &&
                                                    <div className="action-proj-dd">
                                                        <ul>
                                                            <li onClick={(e) => this.switchToProject(item._id, "edit", e, item)}>
                                                                <span className="action-lbl">Edit</span>
                                                            </li>
                                                            <li onClick={(e) => this.deleteProject(item._id, e)}>
                                                                <span className="action-lbl">Delete</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                }
                                            </div>
                                        }
                                        <div className="p-c-d">
                                            <div className="title">
                                                <h4>
                                                    {item.title && item.title.quillText ? 
                                                        (item.title.quillText.length < 38 ? item.title.quillText : item.title.quillText.substring(0, 38) + "...") :
                                                        item.title ? (item.title) : "N/A"
                                                    }
                                                </h4>
                                                <h6>This is a demo description.</h6>
                                            </div>
                                        </div>
                                    </div>
                                    ) :
                                    <div className="no-projects-lbl">No Projects Available, Try Creating New Projects.</div>
                            }
                        </div>
                    </>
                }
            </div>
            {
                toggleProjectModal && 
                <ProjectModal 
                    toggleProject={this.toggleProject}
                />
            }
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        projects: state.projects.list,
        activeWSProject: state.wikis.activeWSProject
    }
}

export default withRouter(connect(
    mapStateToProps,
    {
        delProjectMW,
        setProjectsMW,
        setActiveWSProjectMW
    }
)(ProjectsList));