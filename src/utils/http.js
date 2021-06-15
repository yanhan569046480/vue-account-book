import axios from 'axios'

const CONTEXTPATH = process.env.VUE_APP_BASE_URL;

axios.interceptors.request.use(
    function (config) {
        if (process.env.NODE_ENV == 'development') {
            config.url += config.url.indexOf('?') > 0 ? '&isTest=true' : '?isTest=true';
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    function (response) {
        if (response.status == 200) {
            return response.data;
        } else {
            return response;
        }
    },
    function (error) {
        if (error) {
            if (error.response.status == 403) {
                window.location.href = '/login.html';
            }
        }
        return Promise.reject(error);
    }
);

const http = {
    base: (config) => {
        config.url = CONTEXTPATH + config.url;
        return axios.request(config)
    },
    get: (url, params) => {
        url = CONTEXTPATH + url;
        return axios.get(url, {params: params})
    },
    del: (url, params) => {
        url = CONTEXTPATH + url;
        return axios.delete(url, {params: params})
    },
    delWithReqBody: (url, params) => {
        url = CONTEXTPATH + url;
        return axios.delete(url, {data: params})
    },
    head: (url, params) => {
        url = CONTEXTPATH + url;
        return axios.head(url, {params: params})
    },
    post: (url, data, config) => {
        url = CONTEXTPATH + url;
        return axios.post(url, data || {}, config || {})
    },
    put: (url, data, config) => {
        url = CONTEXTPATH + url;
        return axios.put(url, data || {}, config || {})
    },
    patch: (url, data, config) => {
        url = CONTEXTPATH + url;
        return axios.patch(url, data || {}, config || {})
    }
}

export default http;
