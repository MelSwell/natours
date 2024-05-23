class APIQuery {
  constructor(query, urlQuery) {
    this.query = query;
    this.urlQuery = urlQuery;
  }

  filter() {
    // Exclude the following fields because they aren't part of the Tour schema:
    const queryObj = { ...this.urlQuery };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.urlQuery.sort) {
      this.query.sort(this.urlQuery.sort.split(',').join(' '));
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }

  project() {
    if (this.urlQuery.fields) {
      this.query.select(this.urlQuery.fields.split(',').join(' '));
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.urlQuery.page * 1 || 1;
    const limit = this.urlQuery.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIQuery;
