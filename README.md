#denmark-real-estate-valuation

> A stream of real estate valuations given a zipcode and streetname

## Installation

```sheel
npm install denmark-real-estate-valuation
```

## Documentation

```javascript
RealEstateValuation = require('denmark-real-estate-valuation')
```

This is a class constructor with the signature
`RealEstateValuation(zipcode, steetname)`, it returns a readable stream.


```javascript
const valuations = RealEstateValuation(2800, 'Lyngby Hovedgade');
valuations.on('data', function (property) {
  property = {
    id: 51002,
    houseNumber: '1A',
    floor: '2',
    type: 'Ejerlejl. iøvrigt',
    landValue: 10210000, // danish kroner (DKK)
    houseValue: 30500000 // danish kroner (DKK)
  };

  // The real estate value is `property.landValue + property.houseValue`.
});
```

## Source

The source is: http://www.vurdering.skat.dk/borger/ejendomsvurdering/Soeg2.do
The webpage does not provide an API, so this module scrapes the data from it.

##License

**The software is license under "MIT"**

> Copyright (c) 2015 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
