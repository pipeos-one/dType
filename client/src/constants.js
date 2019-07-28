import * as utils from './dtype_utils.js';

const contractsMetadata = require('../../contracts/build/contracts/dType.json');
const aliasMetadata = require('../../contracts/build/contracts/Alias.json');

const DType = {
    rootName: 'dType',
    contract: contractsMetadata,
    aliasmeta: aliasMetadata,
    utils,
};

export default DType;
