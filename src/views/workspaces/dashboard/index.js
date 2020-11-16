import React, { Component } from "react";
import { addWorkspaceMW, setWorkspacesMw, setActiveWSProjectMW, deleteWorkspaceMw } from "../../../store/actions/workspace";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getWorkspaces, deleteWorkspaceService } from "../../../services/workspace";

import "./index.scss";

class WorkspacesDashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            workspace: ""
        }
    }

    handleChange = (e) => {
        // update state
        this.setState({
            workspace: e.target.value
        });
    }

    addToWorkspaces = () => {
        const {
            workspace
        } = this.state;

        const {
            workspaces
        } = this.props;

        let index = workspaces.length;

        this.props.addWorkspaceMW(workspace, index);
        this.setState({
            workspace: ""
        });
    }

    handleWsClick = (ws) => {
        console.log("ws::", ws);
        this.props.setActiveWSProjectMW(ws);
        this.props.history.push("/workspace/"+ws._id+"/dashboard")
    }

    deleteWorkspace = (e, ws) => {
        e.stopPropagation();
        deleteWorkspaceService(ws._id).then(res => {
            this.props.deleteWorkspaceMw(ws);
        })
        .catch(e => {
            console.log("e::", e);
            if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                this.props.history.push("/");
            }
        });
    }

    componentDidMount() {
        // get list of workspaces
        getWorkspaces().then(res => {
            console.log("res from getWorkspaces", res);
            this.props.setWorkspacesMw(res.list);
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
            workspace
        } = this.state;

        const {
            workspaces 
        } = this.props;

        return (
            <>
            <div>
                <span>Workspaces:</span>
                <span>
                    <input type="text" value={workspace} onChange={this.handleChange} /> 
                    <button onClick={this.addToWorkspaces}>Add</button>
                </span>
            </div>
            <ul className="ws-ls">
                {
                    workspaces.map(ws => <li className="ws-list" onClick={() => this.handleWsClick(ws)}>
                        <span>{ws.name}</span>
                        <button className="del-ws" onClick={($e) => this.deleteWorkspace($e, ws)}>Delete</button>    
                    </li>)
                }
            </ul>
            </>
        )
    }
}

const mapStateToProps = state => {
    // console.log("inside mapStateToPros func in EDIT PAGE", state);
    return {
        activeWorkspace: state.wikis.activeWorkspace,
        workspaces: state.wikis.workspaces
    }
}

export default withRouter(connect(
    mapStateToProps,
    {
        addWorkspaceMW,
        setWorkspacesMw,
        setActiveWSProjectMW,
        deleteWorkspaceMw
    }
)(WorkspacesDashboard));