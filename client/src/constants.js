import * as utils from './dtype_utils.js';

const contractsMetadata = require('../../contracts/build/contracts/dType.json');
const privateKey = require('../../contracts/private/privateKey.json');

const DType = {
    contract: contractsMetadata,
    from: {
        address: '0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b',
        privateKey: privateKey.privateKey,
    },
    utils,
};

export default DType;
