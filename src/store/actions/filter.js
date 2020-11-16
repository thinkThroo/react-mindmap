export const applyFilter = (value) => ({
    type: 'APPLY_FILTER',
    filter: value
});

export const applyFilterMW = (e) => (dispatch) => {
    let value = e.target.value;
    // console.log("value inside applyFilter func", value);
    dispatch(applyFilter(value));
}