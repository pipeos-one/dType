export const isEthersObj = (item) => {
  if (
    item instanceof Array
    && Object.keys(item).find(key => !Number(key) && Number(key) !== 0)
  ) {
    return true;
  }
  return false;
};

export const normalizeEthersObject = (item) => {
  if (!(item instanceof Object)) return item;
  if (item instanceof Object && item.toNumber) return item.toNumber();
  if (item instanceof Array && !isEthersObj(item)) {
    return item.map(value => normalizeEthersObject(value));
  }
  let obj = {};

  Object.keys(item)
    .filter(key => !Number(key) && Number(key) !== 0)
    .forEach((key) => {
        obj[key] = normalizeEthersObject(item[key]);
    });
  return obj;
};
