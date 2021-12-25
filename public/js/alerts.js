/* eslint-disable */

export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type, msg, time = 7) => { //to be able to set custom time
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    //insert right at beginning of body ie at the top of the page
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, time * 1000);
};