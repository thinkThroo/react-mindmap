import React from "react";
import DateTimePicker from 'react-datetime-picker';

const DTP = ({type, value, handleDTChange}) => {
    return (
        <div>
            <DateTimePicker
                onChange={($event) => handleDTChange(type, $event)}
                value={value}
            />
        </div>
    )
}


export default DTP;