import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // để gửi cookie
});

export default instance;