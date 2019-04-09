const typeContractMetadata = require('../../contracts/build/contracts/typeAContract.json');
const typeInterface = typeContractMetadata.abi;

export const search = (dtypes, substr) => {
    return dtypes.filter(dtype => dtype.name.match(substr));
};

export const buildTypeAbi = (typeAbi) => {
    return typeInterface.map((funcObject) => {
        if (funcObject.name === 'insert') {
            funcObject.inputs[0] = typeAbi;
        }
        if (funcObject.name === 'update') {
            funcObject.inputs[1] = typeAbi;
        }
        if (funcObject.name === 'getByHash') {
            funcObject.outputs[0] = typeAbi;
        }
        return funcObject;
    });
};

export const typeDimensionsToString = (dimensions) => {
    return dimensions.reduce((str, dim) => `${str}[${Number(dim) ? dim : ''}]`, '');
};
