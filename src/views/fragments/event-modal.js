import React, { useState, useEffect } from 'react';
import "./event-modal.css";
import { connect } from "react-redux";
import { setEvent } from "../../store/actions/index";
import DTP from "./date-time-picker";
import { uploadToS3 } from "../../services/index";

const EventModal = ({ event, handleClose, setEvent }) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [uploadInput, setUploadInput] = useState(null);
    const [tagName, setTagName] = useState("");
    const [labelName, setLabelName] = useState("");
    const [tags, setTags] = useState([]);
    const [label, setLabel] = useState([]);

    const handleSubmit = (e) => {
        // console.log("inside handleSubmit func", title, description);
        let data = {
            title,
            description,
            start,
            end
        }
        // console.log("data::", data);
        setEvent(data);
        handleClose(true);
    }

    const handleChange = (e) => {
        if (e.target.name === "title") {
            setTitle(e.target.value);
        } else if (e.target.name === "label") {
            setLabelName(e.target.value);
        } else if (e.target.name === "tag") {
            setTagName(e.target.value);
        } else {
            setDescription(e.target.value);
        }
    }

    const handleDTChange = (type, date) => {
        if (type === "start") {
            setStart(date);
        } else {
            setEnd(date);
        }
    }

    const handleUploadInput = (ref) => {
        setUploadInput(ref);
    }

    // Perform the upload
    const handleUpload = (ev) => {
        let file = uploadInput.files[0];
        // Split the filename to get the name and type
        // let fileParts = uploadInput.files[0].name.split('.');
        let fileName = file.name;
        let fileType = file.type;
        // console.log("Preparing the upload");
        uploadToS3(fileName,
            fileType,
            file);
    }

    const handleAdd = (type, value) => {
        let arr = [{name: value}];;
        if (type === "tag") {
            setTags([...tags, ...arr]);
        } else {
            setLabel([...label, ...arr]);
        }
        setTagName("");
        setLabelName("");
    }

    useEffect(() => {
        if (event && event.id) {
            setTitle(event.title);
            setDescription(event.description);
        }
    }, [event]);

    return (<div id="myModal" className="modal">
        {/* <!-- Modal content --> */}
        <div className="modal-content">
            <div className="modal-header">
                <span className="close" onClick={handleClose}>&times;</span>
                <h2>Add Event</h2>
            </div>
            <div className="modal-body">
                <label>Title:</label>
                <input type="text"
                    name="title"
                    value={title || ''}
                    placeholder="enter title..."
                    onChange={handleChange} />
                <label>Description:</label>
                <input type="textarea"
                    name="description"
                    value={description || ''}
                    placeholder="enter description..."
                    onChange={handleChange} />
                <label>
                    Start Time:
                </label>
                <DTP
                    type="start"
                    handleDTChange={handleDTChange}
                    value={start}
                />
                <label>
                    End Time:
                </label>
                <DTP
                    type="end"
                    handleDTChange={handleDTChange}
                    value={end}
                />
                <div>
                    <label>Attach Files</label>
                    <input
                        type="file"
                        ref={(ref) => { handleUploadInput(ref) }} />
                    <button
                        onClick={handleUpload}
                    >upload</button>
                </div>
                <div>timer options</div>
                <div>
                    <span>Tags component</span>
                    <input 
                        type="text"
                        name="tag"
                        value={tagName}
                        onChange={handleChange}
                    />
                    <button onClick={() => handleAdd("tag", tagName)}>Add Tag</button>
                    <ul>
                        {
                            tags.map((tag, i) => <li key={i}>{tag.name}</li>)
                        }
                    </ul>
                </div>
                <div>
                    <span>Label component</span>
                    <input 
                        type="text"
                        name="label"
                        value={labelName}
                        onChange={handleChange}
                    />
                    <button onClick={() => handleAdd("label", labelName)}>Add Label</button>
                    <ul>
                        {
                            label.map((l,i) => <li key={i}>{l.name}</li>)
                        }
                    </ul>
                </div>
                {/* <div>Voice based task addition</div> */}
            </div>
            <div className="modal-footer">
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    </div>
    )
}

export default connect(
    null,
    { setEvent }
)(EventModal);