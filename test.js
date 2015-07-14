
'use strict';
'use strong';

const test = require('tap').test;
const endpoint = require('endpoint');
const RealEstatValuation = require('./index.js');

function isNumber(val) {
  // Some of the values may be NaN
  return typeof val === 'number';
}

function isString(val) {
  return typeof val === 'string';
}

test('correct zipcode and street name', function (t) {
  new RealEstatValuation(2800, 'Lyngby Hovedgade')
    .pipe(endpoint({objectMode: true}, function (err, evaluations) {
      t.ifError(err);
      t.ok(evaluations.length > 0);
      for (const item of evaluations) {
        t.ok(isNumber(item.id), 'id is number');
        t.ok(isString(item.houseNumber), 'house number is string');
        t.ok(isString(item.floor), 'floor is string');
        t.ok(isString(item.type), 'type is string');
        t.ok(isNumber(item.landValue), 'land value is number');
        t.ok(isNumber(item.houseValue), 'house value is number');
      }
      t.end();
    }));
});

test('incorrect zipcode', function (t) {
  new RealEstatValuation(1, 'Lyngby Hovedgade')
    .pipe(endpoint({objectMode: true}, function (err, evaluations) {
      t.equal(err.name, 'Error');
      t.equal(err.message, 'Fejl i POSTNR, indtast korrekt 4-cifret postnummer');
      t.equal(evaluations.length, 0);
      t.end();
    }));
});

test('incorrect streetname', function (t) {
  new RealEstatValuation(2800, 'WRONG')
    .pipe(endpoint({objectMode: true}, function (err, evaluations) {
      t.equal(err.name, 'Error');
      t.equal(err.message, 'Vælg et vejnavn fra listen over vejnavne');
      t.equal(evaluations.length, 0);
      t.end();
    }));
});
