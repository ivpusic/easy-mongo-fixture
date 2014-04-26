easy-mongo-fixture
==================
[![Build Status](https://travis-ci.org/ivpusic/easy-mongo-fixture.svg?branch=master)](https://travis-ci.org/ivpusic/easy-mongo-fixture)

Mongo fixture manager for [easy-fixture](https://github.com/ivpusic/easy-fixture) lib.

### Example

```
var fixture = require('easy-fixture');
var MongoFixture = require('easy-mongo-fixture');

// init MongoFixture middleware
var mongoFixture = new MongoFixture({
  database: 'test',
  collections: ['products', 'categories'],
  dir: 'fixture',
  override: true
});

// set middleware to use
fixture.use(mongoFixture);

// collect data from mongo database and save it to local file(s)
fixture.save();

// when we need to load fixture, call this method to read from fixture file,
// and to import wanted data
fixture.load();
```

# License
**MIT**
