
export function ObjectGroupBy(arrayOfObjects, fallbackFunction) {
  if (typeof Object.groupBy === "function") {
    return Object.groupBy(arrayOfObjects, fallbackFunction);
  }

  return arrayOfObjects.reduce((acc, obj) => {
    const key = fallbackFunction(obj);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

export function groupBySingle(array, key) {
  return array.reduce((acc, obj) => {
    // If key is a function, execute it to get the key value
    const keyValue = typeof key === "function" ? key(obj) : obj[key];

    if (keyValue === undefined || keyValue === null) {
      console.warn("Skipping object with invalid key:", obj);
      return acc; // Skip items without a valid key
    }

    acc[keyValue] = obj; // Store the object directly
    return acc;
  }, {});
}