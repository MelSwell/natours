const size = require('lodash.size');
const AppError = require('../utils/appError');

module.exports = (reqBody, ...permittedFields) => {
  return new Promise((resolve, reject) => {
    if (size(reqBody) > 25) {
      reject(
        new AppError('The body of your request contains too many fields', 400),
      );
    }

    const clone = {};
    for (const field in reqBody) {
      if (permittedFields.includes(field)) clone[field] = reqBody[field];
    }
    resolve(clone);
  });
};
