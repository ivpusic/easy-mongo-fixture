'use strict';

var util = require('util'),
  exec = require('child_process').exec,
  Q = require('q'),
  path = require('path'),
  fs = require('fs'),
  Base = require('easy-fixture').Base;

/**
 * Construct appropriate mongo import/export commands based on passed configuration
 *
 * @param {Object} obj key/value pairs which will be converted into CLI arguments style
 * @param {Object} opts Additional configuration for function
 *
 * @return {String}
 *
 * @api private
 */

function constructCommand(obj, opts) {
  var res = opts.isImport ? 'mongoimport ' : 'mongoexport ';

  for (var key in obj) {
    if (obj[key]) {
      res += key + ' ' + obj[key] + ' ';
    }
  }

  var location = path.join(opts.dir, obj['--collection']),
    mode = opts.isImport ? '--file' : '--out';

  res += mode + ' ' + location + '.json';
  return res;
}

function constructDropCollectionCommand(database, collection) {
  return util.format('mongo %s --eval "db.%s.drop()"', database, collection);
}

/**
 * Run mongodb commands based on provided configuration
 *
 * @return {Promise}
 *
 * @api private
 */

function runCommands(ctx) {
  var commands = [];

  commands = ctx.collections.map(function (collection) {
    // if we don't want to override existing fixture files/database records if they exists
    // we are just returning dummy promise
    if (fs.existsSync(path.join(ctx.dir, collection + '.json')) && !ctx.override) {
      return new Q();
    }

    var seed = ctx.isImport ? Q.nfcall(exec, constructDropCollectionCommand(ctx.database, collection)) : new Q();

    return seed.then(function () {
      ctx.config['--collection'] = collection;

      return Q.nfcall(exec, constructCommand(ctx.config, {
        dir: ctx.dir,
        isImport: ctx.isImport
      }));
    });
  });

  return Q.all(commands);
}

function MongoFixture(opts) {
  Base.call(this);

  this.config = {
    '--host': opts.host || '127.0.0.1',
    '--port': opts.port || 27017,
    '--username': opts.username || '',
    '--password': opts.password || '',
    '--db': opts.database || ''
  };

  this.dir = opts.dir || '';
  this.collections = opts.collections || [];
  this.override = opts.override || false;
  this.database = opts.database || '';
}

util.inherits(MongoFixture, Base);

/**
 * Method will read data from fixture files, and import records into mongo database
 * provided by configuration
 *
 * @return {Promise}
 *
 * @api public
 */

MongoFixture.prototype._load = function () {
  this.isImport = true;
  return runCommands(this);
};

/**
 * Method will load data from mongodb, and save it to JSON file
 * For each specified collection .JSON file with exported data will be created
 *
 * Method will return promise which will be fullfilled if all fixture files are created succesufully
 *
 * @return {Promise}
 *
 * @api public
 */

MongoFixture.prototype._save = function () {
  this.isImport = false;
  return runCommands(this);
};

/**
 * Expose MongoFixture
 */

module.exports = MongoFixture;
