const axios = require('axios');
const BASE = process.env.TEST_HOST || 'http://localhost:3000';

let token = '';

const setToken = (t) => { token = t; };
const getToken = () => token;

const api = axios.create({ baseURL: BASE, timeout: 15000 });

// 统一请求封装
const request = async (method, url, data, opts = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.headers) Object.assign(headers, opts.headers);

  const start = Date.now();
  try {
    const res = await api({ method, url, data, params: opts.params, headers });
    return { ...res.data, _status: res.status, _ms: Date.now() - start };
  } catch (err) {
    if (err.response) {
      return { ...err.response.data, _status: err.response.status, _ms: Date.now() - start };
    }
    return { code: -1, message: err.message, data: null, _status: 0, _ms: Date.now() - start };
  }
};

const get = (url, params) => request('get', url, undefined, { params });
const post = (url, data) => request('post', url, data);
const put = (url, data) => request('put', url, data);
const del = (url) => request('delete', url);

module.exports = { setToken, getToken, get, post, put, del, BASE };
