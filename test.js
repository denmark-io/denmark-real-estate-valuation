
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

test('correct zipCode and street name', function (t) {
  new RealEstatValuation({ zipCode: 2800, streetName: 'Lyngby Hovedgade' })
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

test('correct municipalityCode and street name', function (t) {
  new RealEstatValuation({ municipalityCode: 173, streetName: 'Lyngby Hovedgade' })
    .once('data', function (item) {
      t.ok(isNumber(item.id), 'id is number');
      t.ok(isString(item.houseNumber), 'house number is string');
      t.ok(isString(item.floor), 'floor is string');
      t.ok(isString(item.type), 'type is string');
      t.ok(isNumber(item.landValue), 'land value is number');
      t.ok(isNumber(item.houseValue), 'house value is number');
      t.end();
    });
});

test('correct municipalityCode and street code', function (t) {
  new RealEstatValuation({ municipalityCode: 173, streetCode: 535 })
    .once('data', function (item) {
      t.ok(isNumber(item.id), 'id is number');
      t.ok(isString(item.houseNumber), 'house number is string');
      t.ok(isString(item.floor), 'floor is string');
      t.ok(isString(item.type), 'type is string');
      t.ok(isNumber(item.landValue), 'land value is number');
      t.ok(isNumber(item.houseValue), 'house value is number');
      t.end();
    });
});

test('missing area code', function (t) {
  try {
    new RealEstatValuation({ streetName: 'Lyngby Hovedgade' });
  } catch(err) {
    t.equal(err.name, 'TypeError');
    t.equal(err.message, 'either zipcode or the municipality code should be set');
    t.end();
  }
});

test('missing steet name', function (t) {
  try {
    new RealEstatValuation({ zipCode: 2800 });
  } catch(err) {
    t.equal(err.name, 'TypeError');
    t.equal(err.message, 'the steet name or code should be set');
    t.end();
  }
});

test('correct zipCode and street code', function (t) {
  try {
    new RealEstatValuation({ zipCode: 2800, streetCode: 535 });
  } catch(err) {
    t.equal(err.name, 'TypeError');
    t.equal(err.message, 'the steet name or code should be set');
    t.end();
  }
});

test('incorrect zipcode', function (t) {
  new RealEstatValuation({ zipCode: 1, streetName: 'Lyngby Hovedgade' })
    .pipe(endpoint({objectMode: true}, function (err, evaluations) {
      t.equal(err.name, 'Error');
      t.equal(err.message, 'Fejl i POSTNR, indtast korrekt 4-cifret postnummer');
      t.equal(evaluations.length, 0);
      t.end();
    }));
});

test('incorrect streetname', function (t) {
  new RealEstatValuation({ zipCode: 2800, streetName: 'WRONG' })
    .pipe(endpoint({objectMode: true}, function (err, evaluations) {
      t.equal(err.name, 'Error');
      t.equal(err.message, 'Vælg et vejnavn fra listen over vejnavne');
      t.equal(evaluations.length, 0);
      t.end();
    }));
});
