const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');

const makeUrl = ({ apiKey, apiPass, hostname }, path) => `https://${apiKey}:${apiPass}@${hostname}/admin/api/2020-07/${path}`;

const apiGet = (auth, path, param = {}) => {
  const url = makeUrl(auth, path);
  return axios({ method: 'get', url, params: { ...param, limit: 250 } })
      .then((res) => res.data);
};

const apiPost = (auth, path, data = {}) => {
  const url = makeUrl(auth, path);
  return axios({ method: 'post', url, data })
    .then((res) => res.data);
};

const writeToFile = (result, filePath)  => {
  mkdirp.sync(filePath.split('/').slice(0, -1).join('/'));
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
};


module.exports.apiGet = apiGet;
module.exports.apiPost = apiPost;
module.exports.writeToFile = writeToFile;
