pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypeLib.sol';
import './dTypesLib.sol';

interface dTypeInterface {
    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function insert(dTypeLib.dType calldata data) external returns (bytes32 dataHash);

    function update(bytes32 typeHash, dTypeLib.dType calldata data) external returns(bytes32 hash);

    function remove(bytes32 typeHash) external returns(uint256 index);

    function setOptionals(bytes32 typeHash, dTypesLib.dTypes[] calldata optionalValues) external;

    function setOutputs(bytes32 typeHash, dTypesLib.dTypes[] calldata outputValues) external;

    function count() external view returns(uint256 counter);

    function getIndex() external view returns(bytes32[] memory indext);

    function getTypeHash(dTypeLib.LangChoices lang, string calldata name) pure external returns (bytes32 typeHash);

    function getByHash(bytes32 typeHash) view external returns(dTypeLib.dType memory dtype);

    function get(dTypeLib.LangChoices lang, string calldata name) view external returns(dTypeLib.dType memory dtype);

    function isType(bytes32 typeHash) view external returns(bool isIndeed);

    function getOptionals(bytes32 typeHash) view external returns (dTypesLib.dTypes[] memory optionalValues);

    function getOutputs(bytes32 typeHash) view external returns (dTypesLib.dTypes[] memory outputValues);

    function getByIndex(uint256 index) view external returns(dTypeLib.dType memory dtype, bytes32 typeHash);

    function getSignature(bytes32 typeHash) view external returns (bytes4 signature);

    function pipeView(bytes32[] calldata inDataHash, bytes32[] calldata funcHash, bytes calldata freeInputs) external view returns(bytes memory result);

    function runView(bytes32 funcHash, bytes32[] calldata inDataHash, bytes calldata freeInputs) external view returns(bytes memory result);
}
