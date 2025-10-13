/**
 * Checks whether an entity object has valid start and end indices for text replacement.
 *
 * An entity is considered valid if:
 * - `start` and `end` are numbers
 * - `start` is greater than or equal to 0
 * - `end` is greater than `start`
 *
 * @param {{ start: number, end: number }} entity The entity object containing start and end indices.
 * @returns {boolean} `true` if the entity indices are valid, otherwise `false`.
 */
export function isValidEntity(entity) {
  return (
    typeof entity.start === 'number' &&
    typeof entity.end === 'number' &&
    entity.start >= 0 &&
    entity.end > entity.start
  );
}

/**
 * Generates a masking string of a given length using the specified character.
 *
 * @param {number} length The number of times to repeat the mask character.
 * @param {string} [maskChar] Optional single-character mask.
 * @returns {string} A string consisting of the mask character repeated `length` times.
 */
export function maskSubstring(length, maskChar) {
  if (maskChar) {
    return maskChar.repeat(length);
  }
  return '[CENSORED]';
}


/**
 * Checks whether a given string is a valid mask character.
 *
 * A valid mask character must:
 *   1. Be a string of length 1 (Unicode grapheme-safe).
 *   2. Be a visible character (not whitespace).
 *   3. Not be a control character (Unicode category C).
 *
 * Examples of valid mask characters: '*', '#', 'X', '✓'.
 * Examples of invalid mask characters: '', ' ', '\n', '\u0000'.
 *
 * @param {string} maskChar - The character to validate.
 * @returns {boolean} True if maskChar is a single, visible, non-control character; false otherwise.
 */
export function isMaskCharValid(maskChar) {
  if (typeof maskChar !== 'string') return false;

  const chars = [...maskChar]; // Unicode-safe splitting
  if (chars.length !== 1) return false;

  const c = chars[0];
  if (c.trim() === '') return false;        // No whitespace
  if (/\p{C}/u.test(c)) return false;      // No control chars

  return true;
}

/**
 * Checks whether a given value is a valid positive integer (> 0).
 *
 * Conditions:
 *   - Must be of type "number".
 *   - Must be finite (not NaN, Infinity).
 *   - Must be an integer (no decimals).
 *   - Must be strictly greater than 0.
 *   - Must be strictly lower than 8.
 *
 * Examples of valid: 1, 42, 999999
 * Examples of invalid: 0, -5, 3.14, NaN, Infinity, "10", "3,14"
 */
export function isPositiveInteger(value) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value > 0 &&
    value < 8
  );
}

/**
 * Filters out redundant entities from an array by keeping only the largest ones.
 * 
 * If an entity is fully contained within another entity, it will be removed.
 * If an entity fully contains an existing entity, the smaller one is removed and replaced.
 *
 * @param {Array<Object>} entities - The array of entities to filter. Each entity should have:
 *   @property {number} start - The starting index of the entity in the text.
 *   @property {number} end - The ending index of the entity in the text.
 *   @property {string} word - The actual text of the entity.
 *   @property {string} entity_group - The type or category of the entity (e.g., 'SSN', 'EMAIL').
 * @returns {Array<Object>} - A new array containing only the non-redundant, largest entities.
 */
export function filterRedundantEntities(entities) {
  const entityMap = new Map(); // key: "start-end"

  for (const entity of entities) {
    let isContained = false;

    for (const existing of entityMap.values()) {
      // If current entity is fully inside an existing one
      if (entity.start >= existing.start && entity.end <= existing.end) {
        isContained = true;
        break;
      }
      // If current entity fully contains an existing one, replace it
      if (entity.start <= existing.start && entity.end >= existing.end) {
        entityMap.delete(`${existing.start}-${existing.end}`);
      }
    }

    if (!isContained) {
      entityMap.set(`${entity.start}-${entity.end}`, entity);
    }
  }

  return Array.from(entityMap.values());
}
