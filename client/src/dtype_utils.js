export const search = (dtypes, substr) => {
    return dtypes.filter(dtype => dtype.name.match(substr));
};
