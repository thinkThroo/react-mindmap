import React, { Component } from "react";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getWorkspaces, deleteWorkspaceService } from "../../../services/workspace";
import { addWorkspaceMW, setWorkspacesMw, setActiveWSProjectMW, deleteWorkspaceMw } from "../../../store/actions/workspace";
import { getProjects } from "../../../services/dashboard";
import { delProjectMW, setProjectsMW } from "../../../store/actions/projects";

import "./index.scss";

class WorkspaceDD extends Component {
    state = {
        toggleWsModal: false,
        workspace: "",
        data: [],
        allData: [],
        isLblHovered: null,
        activeWsName: "N/A"
    }

    showWsModal = () => {
        this.setState({
            toggleWsModal: !this.state.toggleWsModal
        });
    }

    labelInpChange = (e) => {
        this.setState({ workspace: e.target.value });
        if (e.target.value) {
            console.log("e.target.value:", e.target.value);
            // replace the complete list of labels of with searched result, if not found
            // add it
            let name = e.target.value;
            let allData = this.state.allData;
            // let data = this.props.workspaces;
            let updatedData = allData.filter(item => {
                if (item.name.toLowerCase().includes(name.toLowerCase())) {
                    return item;
                } else {
                    return null;
                }
            });
            // // debugger;
            this.setState({ data: updatedData });
        } else {
            // if the text search is cleared, set back the list to full complete list
            this.setState({ data: this.state.allData });
        }
    }

    hoverIn(i) {
        this.setState({ isLblHovered: i });
    }

    hoverOut(i) {
        this.setState({ isLblHovered: null });
    }

    handleWsClick = (ws) => {
        console.log("ws::", ws);
        this.props.setActiveWSProjectMW({
            ...ws
        });
        this.props.setProjectsMW({});
        getProjects(ws._id).then(res => {
            // console.log("res from get project list api-hide loader-set store with the latest list", res);
            this.setState({ loading: false });
            let list = {};
            if (res.list && res.list.length > 0) {
                res.list.forEach(element => {
                    list[element._id] = element;
                });
            }
            this.props.setProjectsMW({ list });
            let wsMeta = {};
            if (res.workspace && res.workspace.length > 0) {
                wsMeta = res.workspace[0];
            }
            this.setState({
                activeWsName: wsMeta
            })
            this.props.setActiveWSProjectMW({
                ...wsMeta
            });
            this.showWsModal();
            this.props.history.push("/workspace/" + ws._id + "/dashboard")
        })
            .catch(e => {
                console.log("e::", e);
                if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                    this.props.history.push("/");
                }
            });
    }

    addToWorkspaces = () => {
        const {
            workspace,
            allData
        } = this.state;

        this.props.addWorkspaceMW(workspace).then(createdWs => {
            allData.push({
                name: workspace,
                _id: createdWs._id
            });
            this.setState({
                workspace: "",
                data: allData,
                allData
            }, () => {
                console.log("allData:", allData)
            });
        })
        .catch(e => {
            console.log("error in creating workspace:", e);
        });
    }

    deleteWorkspace = (e, w) => {
        e.stopPropagation();
        this.props.deleteWorkspaceMw(w);
        // deleteWorkspaceService(ws._id).then(res => {
        //     this.props.deleteWorkspaceMw(ws);
        // })
        // .catch(e => {
        //     console.log("e::", e);
        //     if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
        //         this.props.history.push("/");
        //     }
        // });
        const {
            workspaces
        } = this.props;
        let foundWs = workspaces.filter(ws => ws._id == w._id);
        let index;
        if (foundWs.length == 1) {
            index = workspaces.indexOf(foundWs[0]);
            console.log("FOUND INDEX::", index);
        }
        this.setState({
            data: [
                ...workspaces.slice(0, index),
                ...workspaces.slice(index + 1)
            ]
        })
    }

    componentDidMount() {
        console.log("inside workspace dd component");
        let wsName = "";
        // get list of workspaces
        getWorkspaces().then(res => {
            console.log("res from getWorkspaces", res);
            this.props.setWorkspacesMw(res.list);
            for (let i = 0; i < res.list.length; i++) {
                let w = res.list[i];
                if (this.props.match.params.workspace_id == w._id) {
                    // this.props.setActiveWSProjectMW({
                    //     ...w
                    // });
                    wsName = w;
                }
            }
            this.setState({
                data: res.list,
                allData: res.list,
                activeWsName: wsName
            })
        })
            .catch(e => {
                console.log("e::", e);
                if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                    this.props.history.push("/");
                }
            });
    }

    render() {
        const {
            toggleWsModal,
            workspace,
            data,
            activeWsName
        } = this.state;

        return (
            <>
                <button className="ws-btn" onClick={this.showWsModal}>
                    <span>
                        {
                            activeWsName.name
                        }
                    </span>
                    <img className="dropdown" src="/assets/web/tthroo-dropdown.svg" alt="dropdown-icon" />
                </button>
                {toggleWsModal && <div className="label-dd">
                    <img
                        className="i-close l-close"
                        src="/assets/web/tthroo-close-icon.svg"
                        onClick={this.showWsModal}
                        alt="close-icon" />

                    <div>
                        <div>
                            <h2 className="lm-h">Workspaces</h2>
                        </div>
                        <div className="em">
                            <input type="text" name="workspace"
                                className="lm-inp"
                                placeholder="enter a workspace"
                                onChange={this.labelInpChange}
                                value={workspace} />
                            <button className="add-ws" onClick={this.addToWorkspaces}
                                // disabled={data && data.length !== 0 ? false : true}    
                            >
                                {data && data.length == 0 && <img className="lm-ai" src="/assets/web/tthroo-add-icon.svg" alt="add-icon" />}
                            </button>
                        </div>
                        <div className="em">
                            <ul>
                                {data && data.length !== 0 ? data.map((item, index) => {
                                    {/* {workspaces && workspaces.length !== 0 ? workspaces.map((item, index) => { */ }
                                    return <li
                                        key={item._id}
                                        className={activeWsName._id === item._id ? "active" : ""}
                                        onMouseEnter={() => this.hoverIn(index)}
                                        onMouseLeave={() => this.hoverOut(index)}
                                        onClick={() => this.handleWsClick(item)}
                                    >
                                        {item.name}
                                        {/* {(isLblHovered === index) &&
                                            <img className="lm-di" onClick={($event) => this.deleteWorkspace($event, item)} src="/assets/web/tthroo-del-icon.svg" alt="del-icon" />
                                        } */}
                                    </li>
                                }) :
                                    <div>
                                        No Workspace Found. Try adding a new label.
                                  </div>
                                }
                            </ul>
                        </div>
                    </div>
                </div>}
            </>
        )
    }

}

const mapStateToProps = state => {
    return {
        activeWSProject: state.wikis.activeWSProject,
        workspaces: state.wikis.workspaces
    }
}

export default withRouter(connect(
    mapStateToProps,
    {
        addWorkspaceMW,
        setWorkspacesMw,
        setActiveWSProjectMW,
        deleteWorkspaceMw,
        setProjectsMW
    }
)(WorkspaceDD));