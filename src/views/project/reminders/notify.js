import React, { Component } from "react";
import Notification from 'react-web-notification';

class Notify extends Component {
    constructor (props) {
        super(props);
        this.state = {
            ignore: true,
            title: ''
        };
    }

    handlePermissionGranted() {
        console.log('Permission Granted');
        this.setState({
            ignore: false
        });
    }
    handlePermissionDenied() {
        console.log('Permission Denied');
        this.setState({
            ignore: true
        });
    }
    handleNotSupported() {
        console.log('Web Notification not Supported');
        this.setState({
            ignore: true
        });
    }

    handleNotificationOnClick(e, tag) {
        console.log(e, 'Notification clicked tag:' + tag);
    }

    handleNotificationOnError(e, tag) {
        console.log(e, 'Notification error tag:' + tag);
    }

    handleNotificationOnClose(e, tag) {
        console.log(e, 'Notification closed tag:' + tag);
    }

    handleNotificationOnShow(e, tag) {
        this.playSound();
        console.log(e, 'Notification shown tag:' + tag);
    }

    playSound(filename) {
        document.getElementById('sound').play();
    }

    handleButtonClick() {
        this.notify("On Click Reminder");
    }

    notify = (notifyTitle) => {
        if (this.state.ignore) {
            return;
        }

        const now = Date.now();

        const title = notifyTitle;
        const body = 'Hello' + new Date();
        const tag = now;
        const icon = 'http://localhost:3000/assets/web/tthroo-logo.png';
        // const icon = 'http://localhost:3000/Notifications_button_24.png';

        // Available options
        // See https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
        const options = {
            tag: tag,
            body: body,
            icon: icon,
            lang: 'en',
            dir: 'ltr',
            sound: './sound.mp3'  // no browsers supported https://developer.mozilla.org/en/docs/Web/API/notification/sound#Browser_compatibility
        }
        this.setState({
            title: title,
            options: options
        });
    }

    handleButtonClick2() {
        this.props.swRegistration.getNotifications({}).then(function (notifications) {
            console.log(notifications);
        });
    }

    ws = null;

    componentDidMount() {
        // this.timer = setTimeout(() => {
        //     this.notify("Project Reminder - Sometimes Project title can be huge, need to dig in how this one appears now");
        // }, 3000);
        this.ws = new WebSocket("ws://localhost:3200");
        this.ws.onopen = (event) => {
            console.log("Browser client has established connection with server, sending user_id, project_id to websocket");
            let wsInitObj = {
                user_id: localStorage.getItem("user_id"),
                project_id: this.props.id
            }
            this.ws.send(JSON.stringify(wsInitObj)); 
        };
        this.ws.onmessage = (event) => {
            console.log("message received from server, this is about an alert, see for task_id and alert notification", event.data);
            this.notify("Project Reminder - Sometimes Project title can be huge, need to dig in how this one appears now");
        }
    }

    componentWillUnmount() {
        this.ws.send("close"); 
        this.ws.close();
    }

    render() {
        return (
            <div>
                <button onClick={this.handleButtonClick.bind(this)}>Notif!</button>
                {document.title === 'swExample' && <button onClick={this.handleButtonClick2.bind(this)}>swRegistration.getNotifications</button>}
                <Notification
                    ignore={this.state.ignore && this.state.title !== ''}
                    notSupported={this.handleNotSupported.bind(this)}
                    onPermissionGranted={this.handlePermissionGranted.bind(this)}
                    onPermissionDenied={this.handlePermissionDenied.bind(this)}
                    onShow={this.handleNotificationOnShow.bind(this)}
                    onClick={this.handleNotificationOnClick.bind(this)}
                    onClose={this.handleNotificationOnClose.bind(this)}
                    onError={this.handleNotificationOnError.bind(this)}
                    timeout={5000}
                    title={this.state.title}
                    options={this.state.options}
                    swRegistration={this.props.swRegistration}
                />
                <audio id='sound' preload='auto'>
                    <source src='/reminders-sound/sound.mp3' type='audio/mpeg' />
                    <source src='/reminders-sound/sound.ogg' type='audio/ogg' />
                    <embed hidden={true} autostart='false' loop={false} src='./sound.mp3' />
                </audio>
            </div>
        )
    }
};

export default Notify;