import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api", //reemplazar por la URL del backend
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;