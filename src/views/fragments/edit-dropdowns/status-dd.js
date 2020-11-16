import React, { Component } from "react";
import { connect } from 'react-redux';
import { setStatusMW } from "../../../store/actions/status";

import "./status-dd.scss";

class StatusDD extends Component {

    state = {
        showStatusDD: false
    }

    changeStatus(e) {
        e.persist();
        this.props.setStatusMW(e);
        this.setState({ showStatusDD: !this.state.showStatusDD });
        this.props.modalClickHandler();
    }

    toggleStatus() {
        this.setState({ showStatusDD: !this.state.showStatusDD });
        this.props.modalClickHandler();
    }

    render() {

        const {
            data,
            activeStatus,
            onlyInput,
            modalView
        } = this.props;

        const {
            showStatusDD
        } = this.state;


        return (
            <>
                {
                    !onlyInput && 
                    <div className="sb-lbl">
                        Status
                    </div>
                }
                <div>
                    <div>
                        <label onClick={this.toggleStatus.bind(this)}>
                            <button className={modalView ? "modal-bg sb-btn em" : "sb-btn em"}>
                                <span className="btn-inr">
                                    <span>{activeStatus}</span>
                                    <img className={showStatusDD ? "dropdown dropdown-on" : "dropdown"} src="/assets/web/tthroo-dropdown.svg" />
                                </span>
                            </button>
                        </label>
                    </div>
                        {
                            showStatusDD &&
                            <div className="status-dd">
                                <ul>
                                    {
                                        data.map(item => <li
                                            className={activeStatus == item.label ? "active" : ""}
                                            onClick={this.changeStatus.bind(this)}
                                            name={item.label}
                                        >
                                            {item.label}</li>)
                                    }
                                </ul>
                            </div>
                        }
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    // console.log("inside mapStateToPros func in container component: calendar-view::", state);
    return {
        data: state.sideBar.status.data,
        activeStatus: state.sideBar.status.activeStatus
    }
}

export default connect(
    mapStateToProps,
    { setStatusMW }
)(StatusDD);