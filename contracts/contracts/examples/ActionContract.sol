pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import '../dTypeInterface.sol';
import './permissions/PermissionFunctionLib.sol';
import './voting/VoteResourceTypeLib.sol';
import './voting/VotingProcessLib.sol';
import './voting/VotingMechanismTypeLib.sol';

contract ActionContract {

    dTypeInterface public dtype;
    address public permissionAddress;
    address public votingAddress;
    address public votingProcess;
    address public votingMechanism;

    event LogDebug(bytes data, string msg);

    constructor(address _dtypeAddress, address _permissionAddress, address _votingAddress, address _votingProcess, address _votingMechanism) public {
        require(_dtypeAddress != address(0));
        require(_permissionAddress != address(0));
        require(_votingAddress != address(0));
        require(_votingProcess != address(0));
        require(_votingMechanism != address(0));

        dtype = dTypeInterface(_dtypeAddress);
        permissionAddress = _permissionAddress;
        votingAddress = _votingAddress;
        votingProcess = _votingProcess;
        votingMechanism = _votingMechanism;
    }

    function run(address contractAddress, bytes4 funcSig, bytes memory data) public {
        // get Permission
        (bool success, bytes memory out) = permissionAddress.staticcall(
            abi.encodeWithSignature('get((address,bytes4))', contractAddress, funcSig)
        );
        PermissionFunctionLib.PermissionFunctionRequired memory permission = abi.decode(out, (PermissionFunctionLib.PermissionFunctionRequired));
        // return permission;
        // if allowed -> forward call to contract
        if (permission.anyone ==  true || permission.allowed == msg.sender) {
            (bool success, bytes memory out) = contractAddress.call(abi.encodePacked(funcSig, data));
        }
        if (permission.temporaryAction != bytes4(0) && permission.votingProcessDataHash != bytes32(0)) {
            (bool success, bytes memory out) = contractAddress.call(abi.encodePacked(permission.temporaryAction, data));
            emit LogDebug(out, 'temporaryAction');

            // Insert new voting resource
            (bool success2, bytes memory out2) = votingAddress.call(abi.encodeWithSignature(
                'insert((address,address,bytes32,bytes32,uint256,uint256))',
                msg.sender,
                contractAddress,
                abi.decode(out, (bytes32)),
                permission.votingProcessDataHash,
                0,
                0
            ));
            emit LogDebug(out2, 'votingProcessDataHash');
        }
    }

    function run(address contractAddress, bytes4 funcSig, bytes32 dataHash, bytes memory data) public {
        // get Permission
        // if allowed -> forward call to contract
    }

    function vote(bytes32 votingResourceHash, bytes memory voteData) public {
        // Get voting resource
        (bool success, bytes memory out) = votingAddress.staticcall(abi.encodeWithSignature(
            'getByHash(bytes32)',
            votingResourceHash
        ));
        emit LogDebug(out, 'votingResourceHash');

        VoteResourceTypeLib.VoteResource memory resource = abi.decode(out, (VoteResourceTypeLib.VoteResource));

        (bool success2, bytes memory out2) = votingProcess.staticcall(abi.encodeWithSignature(
            'getByHash(bytes32)',
            resource.votingProcessDataHash
        ));
        emit LogDebug(out2, 'votingProcess');

        VotingProcessLib.VotingProcessRequired memory process = abi.decode(out2, (VotingProcessLib.VotingProcessRequired));

        (bool success3, bytes memory out3) = votingMechanism.staticcall(abi.encodeWithSignature(
            'getByHash(bytes32)',
            process.votingMechanismDataHash
        ));
        emit LogDebug(out3, 'votingMechanism');

        VotingMechanismTypeLib.VotingMechanism memory mechanism = abi.decode(out3, (VotingMechanismTypeLib.VotingMechanism));
        bytes32[] memory dataHashes;
        bytes memory voteResult = dtype.pipeView(dataHashes, mechanism.processVoteFunctions, voteData);
        emit LogDebug(voteResult, 'processVoteFunctions');

        // votingAddress.call(abi.encodeWithSignature(
        //     'update(bytes32,(bool,uint256,address))',
        //     votingResourceHash,
        //     voteResult
        // ));
        votingAddress.call(abi.encodePacked(bytes4(keccak256(bytes('update(bytes32,(bool,uint256,address))'))), votingResourceHash, voteResult));

        voteState(votingResourceHash, mechanism, process, voteResult);

        // TODO maybe voting functions also work on vote resource -> returns new VoteResource
    }

    // Split this because code is awful and we get a stack too deep err
    // TODO - use interfaces or tbd
    function voteState(
        bytes32 votingResourceHash,
        VotingMechanismTypeLib.VotingMechanism memory mechanism,
        VotingProcessLib.VotingProcessRequired memory process,
        bytes memory voteData
    )
        public
    {
        (bool success, bytes memory out) = votingAddress.staticcall(abi.encodeWithSignature(
            'getByHash(bytes32)',
            votingResourceHash
        ));
        VoteResourceTypeLib.VoteResource memory resource = abi.decode(out, (VoteResourceTypeLib.VoteResource));

        emit LogDebug(abi.encodePacked(out, voteData, abi.encode(mechanism.parameters)), 'votiiiiing');

        bytes32[] memory dataHashes;
        bytes memory stateChoice = dtype.pipeView(
            dataHashes,
            mechanism.processStateFunctions,
            abi.encodePacked(out, voteData, abi.encode(mechanism.parameters))
        );
        emit LogDebug(stateChoice, 'processStateFunctions');

        (bool triggerAction, uint8 actionType) = abi.decode(stateChoice, (bool,uint8));
        if (triggerAction == true) {
            if (actionType == 1) {
                resource.contractAddress.call(abi.encodePacked(
                    process.funcHashYes,
                    resource.dataHash
                ));
            } else {
                resource.contractAddress.call(abi.encodePacked(
                    process.funcHashNo,
                    resource.dataHash
                ));
            }
        }
    }
}
