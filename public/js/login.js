/* eslint-disable */

const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,      //email:email --new ES6 syntax
                password
            }
        });

        if (res.data.status === 'success') {
            alert('Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

document.querySelector('.form').addEventListener('submit', e => {    //form has class .form
    e.preventDefault();  //to prevent loading any other page

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);

})