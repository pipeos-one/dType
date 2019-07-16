pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./lib/ECVerify.sol";
import './dTypeInterface.sol';

contract Alias {
    // loredata.dataType1   // domain
    // chris@repoUsers      // person hash = address
    // topic#posts          // concept
    // something/dataType4  // hash ; compatible to move
    // hashItem/hashType 0x

    string public constant signaturePrefix = '\x19Ethereum Signed Message:\n';
    uint256 public chainId;
    dTypeInterface public dtype;

    struct Alias {
        address owner;
        uint64 nonce;
        bytes32 identifier;
    }

    mapping (bytes => Alias) public aliases;

    event AliasSet(bytes32 dtypeIdentifier, string name, string separator, bytes32 indexed identifier);

    constructor(address _dtypeAddress, uint256 _chainId) public {
        require(_dtypeAddress != address(0x0));
        require(_chainId > 0);

        dtype = dTypeInterface(_dtypeAddress);
        chainId = _chainId;
    }

    function setAlias(bytes32 dtypeIdentifier, string memory name, string memory separator, bytes32 identifier, bytes memory signature) public {
        require(bytes(separator).length == 1);
        require(checkCharExists(name, separator) == false, 'Name contains separator');

        // check if dtypeIdentifier exists
        // get storage contract address
        // check data identifier in storage contract
        // if data is owned by the signer, set the alias

        bytes memory key = abi.encodePacked(name, separator);
        uint64 nonce = aliases[key].nonce;
        address owner = recoverAddress(name, separator, identifier, nonce + 1, signature);

        if (aliases[key].owner != address(0)) {
            require(aliases[key].owner == owner, 'Not owner');
            aliases[key].identifier = identifier;
        } else {
            aliases[key] = Alias(owner, 0, identifier);
        }
        aliases[key].nonce += 1;

        emit AliasSet(dtypeIdentifier, name, separator, identifier);

        assert(nonce + 1 == aliases[key].nonce);
    }
    function getAliased(string memory name, string memory separator) view public returns (Alias memory aliasdata) {
        bytes memory key = abi.encodePacked(name, separator);
        return aliases[key];
    }

    function checkCharExists(string memory name, string memory char) pure public returns (bool exists) {
        bytes memory encoded = bytes(name);
        bytes1 echar = bytes1(bytes(char)[0]);
        for (uint256 i = 0; i < encoded.length; i++) {
            if (encoded[i] == echar) {
                exists = true;
            }
        }
        return exists;
    }

    function strSplit( string memory name, string memory separator) public pure returns(string memory name1, string memory name2) {
        bytes memory nameb = bytes(name);
        bytes1 sep = bytes1(bytes(separator)[0]);
        bytes memory name1b = "";
        bool done1 = false;
        bytes memory name2b = "";
        for (uint256 i = 0; i < nameb.length - 1; i++){
            if (nameb[i] == sep){
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
        string memory separator,
        bytes32 identifier,
        uint64 nonce,
        bytes memory signature
    )
        public
        view
        returns(address signer)
    {
        // 20 + 32 + 32 + 8 = 92
        string memory message_length = uintToString(92 + bytes(name).length + bytes(separator).length);

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
