pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './lib/ECVerify.sol';
import './dTypeInterface.sol';
import './dTypeLib.sol';

contract Alias {
    // general domain separation: domain.subdomain.leafsubdomain.resource
    // actor-related data: alice@socialnetwork.profile
    // identifying concepts: topicX#postY
    // general resource path definition: resourceRoot/resource

    string public constant signaturePrefix = '\x19Ethereum Signed Message:\n';
    uint256 public chainId;
    dTypeInterface public dType;

    struct Alias {
        address owner;
        uint64 nonce;
        bytes32 identifier;
    }

    mapping (bytes => Alias) public aliases;

    event AliasSet(bytes32 dTypeIdentifier, string name, bytes1 separator, bytes32 indexed identifier);

    constructor(address _dTypeAddress, uint256 _chainId) public {
        require(_dTypeAddress != address(0x0));
        require(_chainId > 0);

        dType = dTypeInterface(_dTypeAddress);
        chainId = _chainId;
    }

    function setAlias(bytes32 dTypeIdentifier, string memory name, bytes1 separator, bytes32 identifier, bytes memory signature) public {
        require(separator != bytes1(0));
        require(checkCharExists(name, separator) == false, 'Name contains separator');

        // check if dtypeIdentifier exists
        // get storage contract address
        // check data identifier in storage contract
        // if data is owned by the signer, set the alias
        bytes memory key = abi.encodePacked(name, separator);
        uint64 nonce = aliases[key].nonce;
        address owner = recoverAddress(name, separator, identifier, nonce + 1, signature);
        require(owner != address(0), 'No signer');

        bool remove = identifier == bytes32(0);
        bool exists = aliases[key].owner != address(0);
        bool isOwner = aliases[key].owner == owner;

        if (remove && !exists) revert('Alias is not set');

        if (remove && isOwner) {
            delete aliases[key];
            emit AliasSet(dTypeIdentifier, name, separator, identifier);
            return;
        }

        checkdType(dTypeIdentifier, identifier);

        if (!exists) {
            aliases[key] = Alias(owner, 0, identifier);
        } else {
            require(isOwner, 'Not owner');
            aliases[key].identifier = identifier;
        }

        aliases[key].nonce += 1;
        emit AliasSet(dTypeIdentifier, name, separator, identifier);

        assert(nonce + 1 == aliases[key].nonce);
    }

    function checkdType(bytes32 dTypeIdentifier, bytes32 identifier) view public {
        bool success;
        bytes memory result;

        dTypeLib.dType memory typedata = dType.getByHash(dTypeIdentifier);
        require(typedata.contractAddress != address(0), 'Inexistent type');

        (success, result) = typedata.contractAddress.staticcall(abi.encodeWithSignature('isStored(bytes32)', identifier));
        require(success, 'isStored failed');
        require(keccak256(result) == keccak256(abi.encodePacked(uint256(1))), 'Not stored');

        // TODO check ownership
    }

    function getdTypeData(bytes32 dTypeIdentifier, bytes32 identifier) view public returns(bytes memory data) {
        bool success;
        bytes memory result;

        dTypeLib.dType memory typedata = dType.getByHash(dTypeIdentifier);
        (success, result) = typedata.contractAddress.staticcall(abi.encodeWithSignature('getByHash(bytes32)', identifier));
        require(success, 'Storage call failed');
        return result;
    }

    function getAliased(string memory name, bytes1 separator) view public returns (bytes32 identifier) {
        bytes memory key = abi.encodePacked(name, separator);
        return aliases[key].identifier;
    }

    function getAlias(bytes32 dTypeIdentifier, string memory name, bytes1 separator) view public returns(bytes32 identifier, bytes memory data) {
        bytes memory key = abi.encodePacked(name, separator);
        return (aliases[key].identifier, getdTypeData(dTypeIdentifier, aliases[key].identifier));
    }

    function getAliasedData(string memory name, bytes1 separator) view public returns (Alias memory aliasdata) {
        bytes memory key = abi.encodePacked(name, separator);
        return aliases[key];
    }

    function checkCharExists(string memory name, bytes1 char) pure public returns (bool exists) {
        bytes memory encoded = bytes(name);
        for (uint256 i = 0; i < encoded.length; i++) {
            if (encoded[i] == char) {
                exists = true;
            }
        }
        return exists;
    }

    function strSplit( string memory name, bytes1 separator) public pure returns(string memory name1, string memory name2) {
        bytes memory nameb = bytes(name);
        bytes memory name1b = "";
        bool done1 = false;
        bytes memory name2b = "";
        for (uint256 i = 0; i < nameb.length - 1; i++){
            if (nameb[i] == separator){
                done1 = true;
            } else if (!done1) {
                name1b = abi.encodePacked(name1b, nameb[i]);
            }
            if (done1) {
                name2b = abi.encodePacked(name2b, nameb[i+1]);
            }
        }
        return (string(name1b), string(name2b));

    }

    function recoverAddress(
        string memory name,
        bytes1 separator,
        bytes32 identifier,
        uint64 nonce,
        bytes memory signature
    )
        public
        view
        returns(address signer)
    {
        // 20 + 32 + 32 + 8 + 1 = 92
        string memory message_length = uintToString(93 + bytes(name).length);

        bytes memory data = abi.encodePacked(
          signaturePrefix,
          message_length,
          address(this),
          chainId,
          identifier,
          nonce,
          name,
          separator
        );
        signer = ECVerify.ecverify(keccak256(data), signature);
    }

    function uintToString(
        uint v)
        internal
        pure
        returns (string memory)
    {
        bytes32 ret;
        if (v == 0) {
            ret = '0';
        }
        else {
             while (v > 0) {
                ret = bytes32(uint(ret) / (2 ** 8));
                ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
                v /= 10;
            }
        }

        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint256 j=0; j<32; j++) {
            byte char = byte(bytes32(uint(ret) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[j] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint256 j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }

        return string(bytesStringTrimmed);
    }
}
