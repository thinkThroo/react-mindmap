import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getProject } from "../../../services/project";
import { setActiveWSProjectMW } from "../../../store/actions/workspace";

import "./index.scss";

class Assess extends Component {

    componentDidMount() {
        // get params
        const {
            workspace_id,
            id
        } = this.props.match.params;
        console.log("workspace_id", workspace_id);

        const {
            activeWSProject
        } = this.props;

        // if activeWorkspace is null, it means there is a page refresh, because we set activeProject
        // at the time of navigation from dashborad to workspace view
        console.log("about to get worksapcce data, activeWS", activeWSProject);
        if (typeof activeWSProject == "object" && Object.keys(activeWSProject).length == 0) {
            getProject(workspace_id, id).then(res => {
                console.log("calling the middle ware now", res);
                if (res && res.list && res.list[0]) {
                    this.props.setActiveWSProjectMW(res.list[0]);
                }
            })
                .catch(e => {
                    console.log("e::", e);
                    if (e.status == 401 && e.msg.toLowerCase() == "unauthorized") {
                        this.props.history.push("/");
                    }
                });
        }
    }

    render() {

        const {
            activeWSProject
        } = this.props;

        const {
            title,
            map
        } = activeWSProject;

        let topics;

        if (map != null && map.topics) {
            topics = map.topics;
        }

        console.log("topics:", topics);

        return (
            <div className="dv assess">
                {
                    Object.keys(activeWSProject).length != 0 ?
                        <div className="assess-container">
                            <h1>
                                {title && title.quillText}
                            </h1>
                            <div className="assess-topics-container">
                                <table>
                                    <tr>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Duration</th>
                                        <th>Reward</th>
                                    </tr>

                                    {
                                        topics && topics.map(t =>
                                            <tr>
                                                <td>
                                                    {t.blocks[0].data}
                                                </td>
                                                <td>
                                                    -
                                                </td>
                                                <td>
                                                    -
                                                </td>
                                                <td>
                                                    -
                                                </td>
                                                <td>
                                                    {/* {getDuration(t.properties.endTime)} */}duration
                                                </td>
                                                <td>
                                                    -
                                                </td>
                                            </tr>)
                                    }
                                </table>
                            </div>
                        </div> :
                        <div>
                            Loading...
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        activeWSProject: state.wikis.activeWSProject
    }
}

export default withRouter(connect(
    mapStateToProps,
    {
        setActiveWSProjectMW
    }
)(Assess));