import axios from "axios";
import {BASE_URL} from "./apiEndpoints.js";

const axiosConfig = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

//list of endpoints that do not required authorization header
const excludeEndpoints = ["/login", "/register", "/status", "/activate", "/health"];

//request interceptor
axiosConfig.interceptors.request.use((config) => {
    const shouldSkipToken = excludeEndpoints.some((endpoint) => {
        return config.url?.includes(endpoint)
    });

    if (!shouldSkipToken) {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

//response interceptor
axiosConfig.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if(error.response) {
        if (error.response.status === 401) {
            window.location.href = "/login";
        } else if (error.response.status === 500) {
            console.error("Server error. Please try again later");
        }
    } else if(error.code === "ECONNABORTED") {
        console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
})

export default axiosConfig;



/* Explanation :
### **1️⃣ What are Axios Interceptors?**

Axios interceptors are **functions that run automatically before a request is sent or after a response is received.**
They allow you to **modify requests or handle responses globally** without having to repeat code in every API call.

---

### **2️⃣ Why Use Axios Interceptors?**

* ✅ Automatically attach **authentication tokens (JWT)** to requests.
* ✅ Handle **common errors (401, 500)** globally.
* ✅ Modify headers, URLs, or data before sending.
* ✅ Show/hide loading spinners for every request.
* ✅ Avoid repeating the same code for every API call.

---

### **3️⃣ Code Explanation**

#### **(i) Axios Configuration**

```js
const axiosConfig = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});
```

* Creates a **custom Axios instance** with:

  * `baseURL`: Common URL for all requests (e.g., `https://api.example.com`).
  * Default headers for JSON requests.

---

#### **(ii) Exclude Endpoints**

```js
const excludeEndpoints = ["/login", "/register", "/status", "/activate", "/health"];
```

* Some APIs (like login/register) **don't need JWT tokens**, so they are excluded from token attachment.

---

#### **(iii) Request Interceptor**

```js
axiosConfig.interceptors.request.use((config) => {
    const shouldSkipToken = excludeEndpoints.some((endpoint) => {
        return config.url?.includes(endpoint);
    });

    if (!shouldSkipToken) {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
```

✅ What it does:

* Runs **before every API request**.
* Checks if the request URL is NOT in the excluded list.
* If not excluded → **gets `token` from localStorage** and adds:

```http
Authorization: Bearer <token>
```

* Ensures all protected endpoints get the token automatically.

---

#### **(iv) Response Interceptor**

```js
axiosConfig.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if(error.response) {
        if (error.response.status === 401) {
            window.location.href = "/login";
        } else if (error.response.status === 500) {
            console.error("Server error. Please try again later");
        }
    } else if(error.code === "ECONNABORTED") {
        console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
});
```

✅ What it does:

* Runs **after every API response**.
* Handles:

  * **401 Unauthorized:** Redirects user to `/login`.
  * **500 Server Error:** Logs an error message.
  * **Timeout errors:** Shows a timeout message.
* This way, you don’t need to write error-handling code for every API call manually.

---

### ✅ **In Short**

* **Request interceptor:** Automatically attaches token unless endpoint is excluded.
* **Response interceptor:** Handles errors (401, 500, timeout) globally.
* **Benefit:** Less repeated code, centralized API handling, better security.

---

Would you like me to make a **small flow diagram (Request → Interceptor → Server → Response → Interceptor)** to visually show how this works?
*/