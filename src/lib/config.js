// First we need to import axios.js
import axios from 'axios';
// Next we make an 'instance' of it
const axiosInstance = axios.create({
// .. where we make our configurations
    baseURL: 'http://localhost:4001/v1'
});

// Where you would set stuff like your 'Authorization' header, etc ...

// axiosInstance.defaults.headers.common['Authorization'] = `Bearer `;



export default axiosInstance;