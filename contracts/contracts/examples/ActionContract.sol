pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import '../dTypeInterface.sol';
import './permissions/PermissionStorageInterface.sol';
import './voting/VoteResourceInterface.sol';
import './voting/VotingProcessInterface.sol';
import './voting/VotingMechanismInterface.sol';

contract ActionContract {

    dTypeInterface public dtype;
    PermissionStorageInterface public permission;
    VoteResourceInterface public voting;
    VotingProcessInterface public votingProcess;
    VotingMechanismInterface public votingMechanism;

    event LogDebug(bytes data, string msg);

    constructor(address _dtypeAddress, address _permissionAddress, address _votingAddress, address _votingProcess, address _votingMechanism) public {
        require(_dtypeAddress != address(0));
        require(_permissionAddress != address(0));
        require(_votingAddress != address(0));
        require(_votingProcess != address(0));
        require(_votingMechanism != address(0));

        dtype = dTypeInterface(_dtypeAddress);
        permission = PermissionStorageInterface(_permissionAddress);
        voting = VoteResourceInterface(_votingAddress);
        votingProcess = VotingProcessInterface(_votingProcess);
        votingMechanism = VotingMechanismInterface(_votingMechanism);
    }

    function run(address contractAddress, bytes4 funcSig, bytes memory data) public {
        // Get permission for function
        PermissionLib.PermissionIdentifier memory identifier = PermissionLib.PermissionIdentifier(contractAddress, funcSig, bytes32(0), bytes32(0));

        PermissionLib.PermissionFull memory fpermission = permission.get(identifier);

        // if allowed -> forward call to contract
        if (fpermission.anyone ==  true || fpermission.allowed == msg.sender) {
            (bool success, bytes memory out) = contractAddress.call(abi.encodePacked(funcSig, data));
            require(success == true, 'forwarding failed, sender allowed');
            return;
        }
        if (fpermission.permissionProcess.temporaryAction != bytes4(0) && fpermission.permissionProcess.votingProcessDataHash != bytes32(0)) {
            (bool success, bytes memory out) = contractAddress.call(abi.encodeWithSelector(
                fpermission.permissionProcess.temporaryAction,
                msg.sender,
                data
            ));
            require(success == true, 'temporaryAction failed');
            emit LogDebug(out, 'temporaryAction');

            require(out.length == 32, 'storage function result is not bytes32');
            // Insert new voting resource
            voting.insert(VoteResourceTypeLib.VoteResource(
                msg.sender,
                contractAddress,
                abi.decode(out, (bytes32)),
                fpermission.permissionProcess.votingProcessDataHash,
                0,
                0
            ));
            return;
        }
        revert('Could not run action, faulty permission');
    }

    function runPipe(address contractAddress, bytes4 funcSig, bytes32[] memory functionHashes, bytes32[] memory dataHashes, bytes memory funcSigInputs) public {
        uint256 length = functionHashes.length;
        // TODO check transition is part of funcSig transitions
        for (uint256 i = 0; i < length; i++) {
            PermissionLib.PermissionIdentifier memory identifier = PermissionLib.PermissionIdentifier(contractAddress, funcSig, functionHashes[i], dataHashes[0]);

            PermissionLib.PermissionFull memory fpermission = permission.get(identifier);
            // check permission on transition & dataHash
            if (fpermission.anyone == false && fpermission.allowed != msg.sender) {
                PermissionLib.PermissionFull memory tpermission = permission.get(PermissionLib.PermissionIdentifier(contractAddress, funcSig, functionHashes[i], bytes32(0)));

                // Check permission on funcSig && dataHash
                if (tpermission.anyone == false && tpermission.allowed != msg.sender) {
                    revert('Unauthorized permission');
                    // TODO otherwise, check permissions on funcSig
                }
            }
        }

        bytes memory pipedData = dtype.pipeView(dataHashes, functionHashes, funcSigInputs);
        emit LogDebug(pipedData, 'pipedData');
        run(contractAddress, funcSig, pipedData);
    }

    function vote(bytes32 votingResourceHash, bytes memory voteData) public {
        // Get voting resource
        VoteResourceTypeLib.VoteResource memory resource = voting.getByHash(votingResourceHash);

        VotingProcessLib.VotingProcessRequired memory process = votingProcess.getByHash(resource.votingProcessDataHash);

        VotingMechanismTypeLib.VotingMechanism memory mechanism = votingMechanism.getByHash(process.votingMechanismDataHash);

        bytes32[] memory dataHashes;
        bytes memory voteResult = dtype.pipeView(dataHashes, mechanism.processVoteFunctions, voteData);
        emit LogDebug(voteResult, 'processVoteFunctions');

        address(voting).call(abi.encodePacked(bytes4(keccak256(bytes('update(bytes32,(bool,uint256,address))'))), votingResourceHash, voteResult));

        voteState(votingResourceHash, mechanism, process, voteResult);

        // TODO maybe voting functions also work on vote resource -> returns new VoteResource
    }

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
                    abi.encode(resource.proponent),
                    resource.dataHash
                ));
            } else {
                resource.contractAddress.call(abi.encodePacked(
                    process.funcHashNo,
                    abi.encode(resource.proponent),
                    resource.dataHash
                ));
            }
        }
    }
}
