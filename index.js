const lucene = require('lucene');

filter.default = defaultFilter;
module.exports = filter;

/**
 * Takes the data, Lucene AST, and a walker callback
 * Walks the lucene AST and calls the callback for each row of the data
 * The callback must return boolean which determines whether or not that row would be included in the final result
 *
 * @param {array} data
 * @param {string|object} query Query string (or lucene parsed AST)
 * @param {defaultFilter|object} [opts] Filter callback or options
 */
function filter(data, query, opts = {}) {
  // return console.debug(ast, lucene.parse(ast));

  if (typeof opts === 'function') {
    opts = { filter: opts };
  }
  opts.filter = opts.filter || filter.default;

  /* If no AST, return empty results */
  if (!query) return [];

  /* convert "query:..." string to Lucene AST */
  let ast = query;
  if (typeof ast === 'string') ast = lucene.parse(ast);

  /* "field" indicates a "terminal" point of the AST; this is where the "on" callback is called */
  if (ast.field) return data.filter(row => opts.filter(row, ast));

  /* Process "left" side of the tree */
  let leftData = filter(data, ast.left, opts.filter);

  /* If "NOT", invert "left" result */
  if (ast.start === 'NOT') {
    leftData = data.filter(row => !leftData.includes(row));
  }

  /* If no operator, left side is the only side; return its result */
  if (!ast.operator) return leftData;

  /* "<implicit>" (i.e. no operator) is treated the same as "OR" operator  */
  if (ast.operator === 'OR' || '<implicit>' === ast.operator) {

    /* Process "right" side of the tree with the original data */
    const rightData = filter(data, ast.right, opts.filter);

    /* Since this is an "OR" case, mix the two results (left + right) and return that */
    return Array.from(new Set([...leftData, ...rightData]));

  } else if (ast.operator === 'AND') {
    /* In "AND" case, use the result of the "left" side as an input data for the "right" side  */
    data = leftData;
    return filter(data, ast.right, opts.filter);
  } else if (ast.operator === 'AND NOT' || 'NOT' === ast.operator) {
    /* In "AND NOT" case, get the "right" result from "left" and remove those items from "left" */
    data = leftData;
    const rightData = filter(data, ast.right, opts.filter);
    return data.filter(i => !rightData.includes(i));
  } else if (ast.operator === 'OR NOT') {
    /* Not sure how to implement this... */
    throw new Error(`Unimplemented operator: ${ast.operator}`);
  } else {
    throw new Error(`Unimplemented operator: ${ast.operator}`);
  }
}

/**
 * @callback defaultFilter
 * @param {any} row A row of the data
 * @param {ast} ast
 * @returns {boolean} determines whether or not that row would be included in the final result
 */
function defaultFilter(row, { field, term, term_min, term_max, ...rest }) {
  // console.log({ row, field, term, term_min, term_max, rest });

  if (!rest.quoted) {
    term = term.toLowerCase();
  }

  if (field in row) return check(row[field]);
  else if (field.includes('.')) {
    let value = row;
    for (const key of field.split('.')) {
      if (key in value) value = value[key];
      else return false;
    }
    return check(value);
  } else if (field === '<implicit>') {
    for (const field in row)
      if (defaultFilter(row, { field, term, term_min, term_max, ...rest }))
        return true;
    return false;
  } else return false;

  function check(value) {
    // console.debug({ field, term, value });
    if (term) {
      if (typeof value === 'string') {
        if (!rest.quoted) {
          value = value.toLowerCase();
        }
        let terms;
        if (term.includes('*')) {
          terms = term.split('*').filter(Boolean);
          if (terms.length === 1) {
            term = terms[0];
            terms = null;
          }
        }
        if (terms) {
          let lastIndex = -1;
          for (const term of terms) {
            const index = value.indexOf(term);
            if (index === -1) return false;
            if (index < lastIndex) return false;
            lastIndex = index;
          }
          return true;
        } else {
          return value.includes(term);
        }
      } else if (typeof value === 'number') {
        let sign, num;
        if (typeof term === 'string') {
          if (sign = term.match(/^[<=>]+/)) {
            [sign] = sign;
          }
          num = term.match(/[0-9.]+/);
          if (!num) return false;
          num = [num];
          num = Number(num);
        }
        if (sign) {
          if (sign === '>') {
            return value > num;
          } else if (sign === '>=') {
            return value >= num;
          } else if (sign === '<') {
            return value < num;
          } else if (sign === '<=') {
            return value <= num;
          } else {
            throw new Error(`Invalid sign: ${sign}`);
          }
        } else {
          return value === num;
        }
        // console.log({ term });
        // return term === value;
      } else if (typeof value === 'boolean') {
        if (term === 'false') term = false;
        return term == value;
      } else if (Array.isArray(value)) {
        for (const v of value)
          if (check(v)) return true;
        return false;
      } else {
        return false;
      }
    } else if (term_min || term_max) {
      if (!term_min && term_min !== 0) term_min = -Infinity;
      if (!term_max && term_max !== 0) term_max = Infinity;
      return term_min < value && value < term_max;
    } else {
      throw new Error(`Couldn't find term or term_min/max (Probably unimplemented feature)`);
    }
  }
}

/**
 * @typedef ast
 * @property {string} field
 * @property {string} term
 * @property {string} term_min
 * @property {string} term_max
 */
