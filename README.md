# redis-counter

This is a trivial redis auto-increment counter implementation.

[![NPM info](https://nodei.co/npm/redis-counter.png?downloads=true)](https://npmjs.org/package/redis-counter)

[![Travis build status](https://api.travis-ci.org/Like-Falling-Leaves/redis-counter.png?branch=master)](
https://travis-ci.org/Like-Falling-Leaves/redis-counter)

## Install

    npm install redis-counter

## Initialization

```javascript

   // Initialization via redis URLs of the form: redis://user:password@host:port/
   var counters = require('redis-counter').createCounters({redisUrl: 'redis://user:password@host:port/database'});

   // Specifying collection name instead of defaulting to counters collection.
   // The collection name is the hash name to store the counters under
   var counters = require('redis-counter').createCounters({
     redisUrl: '...',
     collectionName: 'yoyo'
   });

```

## API

```javascript

   counters('requests').increment(); // increments by one, throws away the result
   counters('requests').increment(5); // increments by 5 throws away the result
   counters('requests').increment(5, function (err, currentCount) {
     // currentCount is the updated count.
   });

   // increment by one and get the new value
   counters('requests').increment(function (err, currentCount) {
     // currentCount is the updated count.
   });

   counters('requests').decrement(); // same options with decrement
   counters('requests').get(function (err, val) {
     // fetch the current value
   });
   counters('requests').set(52); // update the value.

   // if you only want to generate unique ids (for URL shortening for example),
   // a much faster method is getNextUniqueId.  It only hits the database every 100
   // calls.  Ofcourse, this has the side effect that the sequence is not strictly
   // monotonically increasing in order and there could be gaps when there are crashes
   // but uniqueness is guaranteed and the ordering will be almost monotonic.  This is
   // suitable for a lot of cases where you just want a small unique ID.

   function getShortUrl(longUrl, done) {
     counters('requests').getNextUniqueId(function (err, uniqueId) {
       if (err) return done(err);
       var shortUrl = '/' + uniqueId.toString(36);
       db.shortUrls.insert(
         {shortUrl: '/' + uniqueId.toString(36), longUrl: longUrl},
         function (err) { return done(err, !err && shortUrl); }
       );
     });
   });
```

