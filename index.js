
'use strict';
'use strong';

const url = require('url');
const util = require('util');
const http = require('http');
const Iconv = require('iconv').Iconv;
const stream = require('stream');
const cheerio = require('cheerio');
const endpoint = require('endpoint');

function RealEstatValuation(zipcode, streetname) {
  if (!(this instanceof RealEstatValuation)) {
    return new RealEstatValuation(zipcode, streetname);
  }
  stream.Readable.call(this, { objectMode: true, highWaterMark: 1 });

  this._zipcode = zipcode;
  this._streetname = streetname;
  this._buffer = [];

  this._nextHref = this._initHref();
}
util.inherits(RealEstatValuation, stream.Readable);
module.exports = RealEstatValuation;

RealEstatValuation.prototype._initHref = function () {
  // Builds the first url, the next urls are scraped from the "next page"
  // button.
  const params = {
    'sideNavn': 'vstartp',
    'VEJKODE': '',
    'POSTNR': this._zipcode,
    'VEJNAVN': this._streetname,
    'HUSNR': '',
    'BOGSTAV': '',
    'ETAGE': '',
    'SIDE': ''
  };

  const href = url.format({
    protocol: 'http',
    hostname: 'www.vurdering.skat.dk',
    pathname: '/borger/ejendomsvurdering/Vis.do',
    query: params,
    method: 'GET'
  });

  return href;
};

RealEstatValuation.prototype._makeRequest = function (href, callback) {
  const req = http.get(href, function (res) {
    res
      .once('error', callback)
      .pipe(new Iconv('latin1', 'utf-8'))
      .pipe(endpoint(function (err, content) {
        if (err) return callback(err);

        callback(null, content);
      }));
  });
  req.once('error', callback);
};

function arrayfrom(iterable) {
  const a = [];
  for (const i = 0; i < iterable.length; i++) a.push(iterable[i]);
  return a;
}

RealEstatValuation.prototype._parseHTML = function (content) {
  const self = this;
  // Parse content
  const $ = cheerio.load(content.toString());

  // Check for errors
  const errorElem = $('.skts-fejltekst-info');
  if (errorElem.length) {
    return {
      error: new Error(errorElem.text().trim()),
      evaluations: [],
      next: null
    };
  }

  // Get evaluations
  const table = $('#skts-indhold-ejendomsvudering table table:nth-child(2) table tr');
  const evaluations = arrayfrom(table.map(function (i, tr) {
    // Convert HTML tr into a simple array
    const row = $(tr).children().map(function (i, td) {
      return $(td).text().trim();
    });

    return self._parseRow(row);
  }));

  // Get url for next page
  const img = $('img[src="/images/svur/vis10eft.gif"]');
  let next = null;
  if (img[0].attribs.alt !== 'Ikke flere ejendomme på vejen') {
    next = img.parent()[0].attribs.href;
    next = url.resolve(this._nextHref, next);
  }

  // Done
  return {
    error: null,
    evaluations: evaluations,
    next: next
  };
};

function parseEvaluation(val) {
  return parseInt(val.replace(/\./g, ''), 10);
}

RealEstatValuation.prototype._parseRow = function (row) {
  return {
    id: parseInt(row[0], 10),
    houseNumber: row[1],
    floor: row[2],
    type: row[3],
    // In danish, . is the thousand seperator - so remove that
    landValue: parseEvaluation(row[4]),
    houseValue: parseEvaluation(row[5])
  };
};

RealEstatValuation.prototype._read = function () {
  const self = this;

  // NOTE: For some reason you can't really have multiply .push in an
  // async stream and have an on('data') event handler. As this causes
  // .read(0) to be called directly after the first .push. So instread
  // of letting node do this, keep an internal buffer.
  if (this._buffer.length > 0) {
    return this.push(this._buffer.shift());
  }

  // Make request and possibol retry
  let called = false;
  this._makeRequest(this._nextHref, function (err, rawHTML) {
    // This callback can be called multiply times, ensure that it
    // only the first is used for data.
    if (called) return undefined;
    called = true;
    if (err) return self.emit('error', err);

    // Fetch evaluations and the next url
    const data = self._parseHTML(rawHTML);
    if (data.error) return self.emit('error', data.error);

    // Update the next href attribute
    if (data.next !== null) self._nextHref = data.next;

    // Set the internal buffer to the observations
    self._buffer = data.evaluations;
    // There is no more data, add null to the internal buffer
    if (data.next === null) {
      self._buffer.push(null);
    }

    // Push data to stream output
    self.push(self._buffer.shift());
  });
};
