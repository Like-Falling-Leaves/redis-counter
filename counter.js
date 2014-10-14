var redis = require('redis');
var url = require('url');
module.exports = counter;
module.exports.createCounters = createCounters;

function createCounters(options) {
  var counters = counter(options);
  return function (name) {
    var uniqueIdPool = [], callbacks = [];
    return {
      increment: counters.increment.bind(null, name),
      decrement: counters.decrement.bind(null, name),
      set: counters.set.bind(null, name),
      get: counters.get.bind(null, name),
      getNextUniqueId: counters.getNextUniqueId.bind(null, name, uniqueIdPool, callbacks)
    };
  }
}

function counter(options) {
  var client;
  return {
    increment: increment,
    decrement: decrement,
    get: get,
    getNextUniqueId: getNextUniqueId,
    set: set
  };

  function getNextUniqueId(counterName, uniqueIdPool, callbacks, done) {
    if (uniqueIdPool.length) return done(null, uniqueIdPool.pop());
    callbacks.push(done);
    if (callbacks.length == 1) {
      increment(counterName, 100, function (err, last) {
        var notifies = callbacks.slice();
        callbacks.length = 0;
        if (!err) for(var jj = 0; jj < 100; jj ++) uniqueIdPool.push(last - jj)
        for (var kk = 0; kk < notifies.length; kk ++) {
          if (err) notifies[kk](err); 
          else getNextUniqueId(counterName, uniqueIdPool, callbacks, notifies[kk]);
        }
      });
    }
  }

  function increment(counterName, by, done) {
    if (typeof(by) == 'function' || typeof(by) == 'undefined') { done = by; by = 1; }
    getClient().hincrby(options.collectionName || 'counters', counterName, by, done);
  }

  function decrement(counterName, by, done) {
    if (typeof(by) == 'function' || typeof(by) == 'undefined') { done = by; by = 1; }
    return increment(counterName, -by, done);
  }

  function get(counterName, done) {
    getClient().hget(options.collectionName || 'counters', counterName, done);
  }

  function set(counterName, seq, done) {
    getClient().hset(options.collectionName || 'counters', counterName, seq, function (err) {
      return done(err, seq);
    });
  }

  function getClient() {
    if (client) return client;
    var uri = url.parse(options.redisUrl || process.env.REDISCLOUD_URL || process.env.REDIS_URL);
    var opts = options.redisOptions || {};
    if (uri.auth) options.auth_pass = uri.auth.split(':')[1];
    client = redis.createClient(+uri.port, uri.hostname, options);
    return client;
  }
}

