export const setLabel = (value) => ({
    type: 'SET_LABEL',
    activeLabel: value
});

export const addLabel = (value) => ({
    type: 'ADD_LABEL',
    label: value
})

export const deleteLabel = (index) => ({
    type: 'DELETE_LABEL',
    index
})

export const setLabelMW = (e) => (dispatch) => {
    let status = e.target.innerText;
    // console.log("value inside setLabelMW func", e);
    dispatch(setLabel(status));
}

export const addLabelMW = (value) => (dispatch) => {
    let label = value
    dispatch(addLabel(label));
};

export const deleteLabelMW = (index) => (dispatch) => {
    dispatch(deleteLabel(index));
};