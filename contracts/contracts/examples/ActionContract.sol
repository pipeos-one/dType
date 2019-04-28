pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import '../dTypeInterface.sol';
import './permissions/PermissionFunctionInterface.sol';
import './voting/VoteResourceInterface.sol';
import './voting/VotingProcessLib.sol';
import './voting/VotingMechanismTypeLib.sol';

contract ActionContract {

    dTypeInterface public dtype;
    PermissionFunctionInterface public permission;
    VoteResourceInterface public voting;
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
        permission = PermissionFunctionInterface(_permissionAddress);
        voting = VoteResourceInterface(_votingAddress);
        votingProcess = _votingProcess;
        votingMechanism = _votingMechanism;
    }

    function run(address contractAddress, bytes4 funcSig, bytes memory data) public {
        // Get permission for function
        PermissionFunctionLib.PermissionFunctionRequired memory fpermission = permission.get(contractAddress, funcSig);

        // if allowed -> forward call to contract
        if (fpermission.anyone ==  true || fpermission.allowed == msg.sender) {
            (bool success, bytes memory out) = contractAddress.call(abi.encodePacked(funcSig, data));
        }
        if (fpermission.temporaryAction != bytes4(0) && fpermission.votingProcessDataHash != bytes32(0)) {
            (bool success, bytes memory out) = contractAddress.call(abi.encodePacked(fpermission.temporaryAction, data));
            emit LogDebug(out, 'temporaryAction');

            // Insert new voting resource
            voting.insert(VoteResourceTypeLib.VoteResource(
                msg.sender,
                contractAddress,
                abi.decode(out, (bytes32)),
                fpermission.votingProcessDataHash,
                0,
                0
            ));
        }
    }

    function run(address contractAddress, bytes4 funcSig, bytes32 dataHash, bytes memory data) public {
        // get Permission
        // if allowed -> forward call to contract
    }

    function vote(bytes32 votingResourceHash, bytes memory voteData) public {
        // Get voting resource
        VoteResourceTypeLib.VoteResource memory resource = voting.getByHash(votingResourceHash);

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

        address(voting).call(abi.encodePacked(bytes4(keccak256(bytes('update(bytes32,(bool,uint256,address))'))), votingResourceHash, voteResult));

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
        VoteResourceTypeLib.VoteResource memory resource = voting.getByHash(votingResourceHash);

        bytes32[] memory dataHashes;
        bytes memory stateChoice = dtype.pipeView(
            dataHashes,
            mechanism.processStateFunctions,
            abi.encodePacked(abi.encode(resource), voteData, abi.encode(mechanism.parameters))
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
