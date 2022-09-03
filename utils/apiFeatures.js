class APIFeatures {
  pageValue;

  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // 1A) filtering...
    const queryObj = { ...this.queryStr };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) advanced filtering...
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      // console.log(req.query);
      //{ sort: 'price,ratingsAverage' }
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query.sort("-createdAt");
    }

    return this;
  }

  fields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      // console.log(req.query);
      this.query.select(fields);
    } else {
      this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limitValue = this.queryStr.limit * 1 || 100;
    const skipValue = (page - 1) * limitValue;
    this.pageValue = page;
    this.query = this.query.skip(skipValue).limit(limitValue);

    return this;
  }
}

module.exports = APIFeatures;
