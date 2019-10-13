/**
 * Returns true if any value in needle array is in haystack array
 * @param hayStackArray array to search
 * @param needleArray array of values to look for
 */
const arrayContains = (hayStackArray: any[], needleArray: any[]) => {
  return hayStackArray.filter(v => needleArray.includes(v)).length > 0;
};

export { arrayContains };
