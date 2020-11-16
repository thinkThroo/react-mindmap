import React, { Component } from "react";
import { connect } from 'react-redux';

import "./label-dd.scss";
import { setLabelMW, addLabelMW, deleteLabelMW } from "../../../store/actions/label";
import { setStatusMW, addStatusMW, deleteStatusMW } from "../../../store/actions/status";
import { updateProject, updateProjectTask } from "../../../store/actions/projects";

class LabelDD extends Component {

    constructor (props) {
        super(props);
        this.deleteLabel = this.deleteLabel.bind(this);
    }

    state = {
        showLabelModal: false,
        labelInp: "",
        data: [],
        isLblHovered: null
    }

    toggleLabelModal() {
        this.setState({ showLabelModal: !this.state.showLabelModal });
        if (this.props.modalClickHandler)
            this.props.modalClickHandler();
    }

    labelInpChange(e) {
        this.setState({ labelInp: e.target.value });
        if (e.target.value) {
            // replace the complete list of labels of with searched result, if not found
            // add it
            let label = e.target.value
            let data = this.state.data;
            let updatedData = data.filter(item => {
                if (item.label.toLowerCase().includes(label.toLowerCase())) {
                    return item;
                } else {
                    return null;
                }
            });
            // // debugger;
            this.setState({ data: updatedData });
        } else {
            // if the text search is cleared, set back the list to full complete list

        }
    }

    addLabel() {
        const {
            labelInp
        } = this.state;

        if (this.props.mode === "label") {
            this.props.addLabelMW(labelInp);
        }
        else {
            this.props.addStatusMW(labelInp);
        }
        this.setState({ labelInp: "" });
    }

    hoverIn(i) {
        this.setState({ isLblHovered: i });
    }

    hoverOut(i) {
        this.setState({ isLblHovered: null });
    }

    deleteLabel(e, i) {
        // console.log("e, i", e, i);
        e.stopPropagation();
        if (this.props.mode === "label") {
            this.props.deleteLabelMW(i);
        } else {
            this.props.deleteStatusMW(i);
        }
    }

    changeLabel = (e) => {
        e.persist();
        let {
            activeProjectId,
            tid,
            updateProjectTask,
            updateProject
        } = this.props;

        debugger;

        if (tid !== undefined) {
            debugger
            let key = "";
            if (this.props.mode === "label")
                key = "label";
            else 
                key = "status";
            updateProjectTask({ id: activeProjectId, tid, key, val: e.target.innerText });
        } else if (activeProjectId !== undefined) {
            let key = "";
            if (this.props.mode === "label")
                key = "label";
            else 
                key = "status";
            updateProject({ id: activeProjectId, key, val: e.target.innerText });
        } else {
            if (this.props.mode === "label")
                this.props.setLabelMW(e);
            else
                this.props.setStatusMW(e);
        }

        this.setState({ showLabelModal: !this.state.showLabelModal });
        if (this.props.modalClickHandler)
            this.props.modalClickHandler();
    }

    componentDidUpdate() {
        this.refData = this.props.data; // complete list
        if (!this.state.data || (this.props.data.length !== this.state.data.length && !this.state.labelInp))
            this.setState({ data: this.props.data })
    }

    componentDidMount() {
        const {
            onlyModal
        } = this.props;

        if (Boolean(onlyModal)) {
            this.setState({ showLabelModal: !this.state.showLabelModal });
        }
    }

    render() {

        const {
            showLabelModal,
            labelInp,
            data,
            isLblHovered
        } = this.state;

        const {
            active,
            onlyInput,
            onlyModal,
            modalView,
            mode,
            value
        } = this.props;

        // console.log("active::", active);

        return (
            <>
                {
                    !onlyInput &&
                    <>
                        {
                            mode === "label" ?
                                <div className="sb-lbl">
                                    Labels
                            </div> :
                                <div className="sb-lbl">
                                    Status
                            </div>
                        }
                    </>
                }
                {
                    !onlyModal && 
                    <label onClick={this.toggleLabelModal.bind(this)}>
                        <button className={modalView ? "modal-bg sb-btn em" : "sb-btn em"}>
                            <span className="btn-inr">
                                <span>{value ? value : active}</span>
                                <img className="dropdown" src="/assets/web/tthroo-dropdown.svg" alt="dropdown-icon" />
                            </span>
                        </button>
                    </label>
                }
                {showLabelModal && <div className="label-dd">
                    <img
                        className="i-close l-close"
                        src="/assets/web/tthroo-close-icon.svg"
                        onClick={this.toggleLabelModal.bind(this)} 
                        alt="close-icon" />

                    <div>
                        {
                            mode === "label" ?
                                <h2 className="lm-h">Labels</h2> :
                                <h2 className="lm-h">Status</h2>
                        }
                        <div className="em">
                            <input type="text" name={mode}
                                className="lm-inp"
                                placeholder="enter a label"
                                onChange={this.labelInpChange.bind(this)}
                                value={labelInp} />
                            <span>
                                <img className="lm-ai" onClick={this.addLabel.bind(this)} src="/assets/web/tthroo-add-icon.svg" alt="add-icon" />
                            </span>
                        </div>
                        <div className="em">
                            <ul>
                                {data && data.length !== 0 ? data.map((item, index) => {
                                    return <li
                                        // className={active === item.label ? "active" : ""}
                                        className={value === item.label ? "active" : ""}
                                        onMouseEnter={() => this.hoverIn(index)}
                                        onMouseLeave={() => this.hoverOut(index)}
                                        onClick={this.changeLabel}
                                    >
                                        {item.label}
                                        {(isLblHovered === index) &&
                                            <img className="lm-di" onClick={($event) => this.deleteLabel($event, index)} src="/assets/web/tthroo-del-icon.svg" alt="del-icon" />
                                        }
                                    </li>
                                }) :
                                    <div>
                                        No Label Found. Try adding a new label.
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

const mapStateToProps = (state, ownProps) => {
    // // console.log("inside mapStateToPros func in container component: label-dd::ownPross::", ownPros);
    if (ownProps.mode === "label") {
        return {
            data: state.sideBar.label.data,
            active: state.sideBar.label.active
        }
    } else {
        return {
            data: state.sideBar.status.data,
            active: state.sideBar.status.active
        }
    }
}

export default connect(
    mapStateToProps,
    {
        addLabelMW,
        deleteLabelMW,
        setLabelMW,
        setStatusMW,
        addStatusMW,
        deleteStatusMW,
        updateProjectTask,
        updateProject
    }
)(LabelDD);