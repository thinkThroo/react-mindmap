export const setDate = (date) => ({
    type: 'SET_DATE',
    activeDate: date
});

export const setDateMW = (date) => (dispatch) => {
    dispatch(setDate(date));
}