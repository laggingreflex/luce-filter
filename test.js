const filter = require('.');

const data = [
  { /* 0 */ name: 'C-3PO', species: 'Droid', height: 1.7526, misc: {} },
  { /* 1 */ name: 'R2-D2', species: 'Droid', height: 1.1, misc: {} },
  { /* 2 */ name: 'Anakin Skywalker', species: 'Human', height: 1.9, family: ['Queen Amidala'], misc: { eye_color: 'yellow' } },
  { /* 3 */ name: 'Obi-Wan Kenobi', species: 'Human', height: 1.8, misc: {} },
  { /* 4 */ name: 'Han Solo', species: 'Human', height: 1.8, misc: {} },
  { /* 5 */ name: 'Princess Leia', species: 'Human', height: 1.5, misc: {} },
];

query('name:r', [data[1], data[2], data[5]], [data[3], data[4]]);
query('name:r2 OR name:3po OR name:obi', [data[0], data[1], data[3]], [data[2], data[4]]);
query('height:[1.4 TO 1.6]', [data[5]], [data[1], data[2], data[3], data[4]]);
query('height:[1.4 TO 1.6}', [data[5]], [data[1], data[2], data[3], data[4]]);
query('height:[1.4 TO 1.5}', [], [data[1], data[2], data[3], data[4], data[5]]);
query('height:{1.4 TO 1.6]', [data[5]], [data[1], data[2], data[3], data[4]]);
query('height:{1.5 TO 1.6]', [], [data[1], data[2], data[3], data[4], data[5]]);
query('height:{1.5 TO 1.5}', [], [data[1], data[2], data[3], data[4], data[5]]);
query('height:[* TO 1.6]', [data[1], data[5]], [data[2], data[3], data[4]]);
query('height:{1.1 TO *]', [data[0], data[2], data[3], data[4], data[5]], [data[1]]);
query('ken', [data[3]], [data[1], data[2], data[4]]);
query('"ken"', [], [data[1], data[2], data[3], data[4]]);
query('height:[1.4 TO 1.6] OR ken', [data[3], data[5]], [data[1], data[2], data[4]]);
query('height:[1.4 TO 1.6] AND ken', [], [data[1], data[2], data[3], data[4], data[5]]);
query('height:[* TO 1.6] AND ken', [], [data[1], data[2], data[3], data[4], data[5]]);
query('family:amidala', [data[2]], [data[1], data[3], data[4], data[5]]);
query('misc.eye_color:yellow', [data[2]], [data[1], data[3], data[4], data[5]]);
query('name:an AND NOT name:wan', [data[2], data[4]], [data[1], data[3], data[5]]);
query('name:an NOT name:wan', [data[2], data[4]], [data[1], data[3], data[5]]);
query('NOT name:wan', [data[0], data[1], data[2], data[4], data[5]], [data[3]]);
query('height:>1.8', [data[2]], [data[1], data[3], data[4], data[5]]);
query('height:>=1.8', [data[2], data[3], data[4]], [data[1], data[5]]);
query('species:h*man', [data[2], data[3], data[4], data[5]], [data[0], data[1]]);
query('species:h*m*n', [data[2], data[3], data[4], data[5]], [data[0], data[1]]);
query('species:h*w*n', [], [data[0], data[1], data[2], data[3], data[4], data[5]]);
query('species:*man', [data[2], data[3], data[4], data[5]], [data[0], data[1]]);
query('species:h*', [data[2], data[3], data[4], data[5]], [data[0], data[1]]);
query('name:*an*', [data[2], data[3], data[4]], [data[0], data[1], data[5]]);

// TODO:
// query('name:an AND NOT wan AND NOT han', [data[2]], [data[1], data[3], data[4], data[5]]);

function query(q, expect = [], notExpect = []) {
  const result = filter(data, q);
  if (expect.length !== result.length) err(`Expected ${expect.length} result item(s), got ${result.length}`, { q, expect, result });
  for (const e of expect)
    if (!result.includes(e)) err(`Expected above row to exist`, { q, expected: e, result });
  for (const e of notExpect)
    if (result.includes(e)) err(`Expected above row NOT to exist`, { q, expected: e, result });
  console.log(`√`, q);
}

function err(msg, data) {
  if (data) console.error(data);
  throw new Error(msg)
}
