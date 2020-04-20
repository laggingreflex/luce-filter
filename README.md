# luce-filter

Customizable data filter for [Lucene][syntax] queries

Inspired by [lucene-filter]. Uses [lucene] parser.

## Install

```
npm i luce-filter
```

## Usage

```js
const filter = require('luce-filter')

const data = [
  { /* 0 */ name: 'C-3PO', species: 'Droid', height: 1.7526, misc: {} },
  { /* 1 */ name: 'R2-D2', species: 'Droid', height: 1.1, misc: {} },
  { /* 2 */ name: 'Anakin Skywalker', species: 'Human', height: 1.9, family: ['Queen Amidala'], misc: { eye_color: 'yellow' } },
  { /* 3 */ name: 'Obi-Wan Kenobi', species: 'Human', height: 1.8, misc: {} },
  { /* 4 */ name: 'Han Solo', species: 'Human', height: 1.8, misc: {} },
  { /* 5 */ name: 'Princess Leia', species: 'Human', height: 1.5, misc: {} },
]

filter(data, 'name:Anakin')
// => [{ /* 2 */ name: 'Anakin Skywalker', ... }]

/* Ranges */
filter(data, 'height:[1.4 TO 1.6]')
// => [{ /* 5 */ name: 'Princess Leia', height: 1.5, ... }]

/* Arrays */
filter(data, 'family:amidala')
// => [{ /* 2 */ name: 'Anakin Skywalker', family: [ 'Queen Amidala' ], ... }]

/* Object properties with dot notation */
filter(data, 'misc.eye_color:yellow')
// => [{ /* 2 */ name: 'Anakin Skywalker', misc: { eye_color: 'yellow' }, ... }]

/* See test.js for more */
```

You may also wrap the default walker with your own:

```js
filter(data, 'size:>1k', (row, { term, ...rest }) => {
  /* do something custom */
  term = term.replace('k', '000');
  /* then revert to default callback */
  return filter.default(row, { term, ...rest });
  /* or return a boolean that determines whether the current row should be included in final result */
})
```

[lucene]: https://github.com/bripkens/lucene
[syntax]: http://www.lucenetutorial.com/lucene-query-syntax.html
[lucene-filter]: https://github.com/finwo/lucene-filter
