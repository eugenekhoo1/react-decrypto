import axios from "axios";

const BASE_URL = "https://decrypto-backend.onrender.com";

export default axios.create({
  baseURL: BASE_URL,
});
