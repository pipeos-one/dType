pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./lib/ECVerify.sol";

contract Alias {
    // loredata.dataType1   // domain
    // chris@repoUsers      // person hash = address
    // topic#posts          // concept
    // something/dataType4  // hash ; compatible to move
    // hashItem/hashType 0x

    string public constant signature_prefix = '\x19Ethereum Signed Message:\n';

    struct Alias {
        address owner;
        bytes32 identifier;
    }

    mapping (bytes => Alias) public aliases;

    function setAlias(string memory name, string memory separator, bytes32 identifier, bytes memory signature) public {
        require(bytes(separator).length == 1);
        require(checkCharExists(name, separator) == false, 'Name contains separator');

        bytes memory key = abi.encodePacked(name, separator);
        address owner = recoverAddress(name, separator, identifier, signature);

        if (aliases[key].owner != address(0)) {
            require(aliases[key].owner == owner, 'Not owner');
            aliases[key].identifier = identifier;
        } else {
            aliases[key] = Alias(owner, identifier);
        }
    }

    function getAlias(string memory name, string memory separator) view public returns (Alias memory aliasdata) {
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

    function recoverAddress(string memory name, string memory separator, bytes32 identifier, bytes memory signature) public pure returns(address signer) {
        string memory message_length = uintToString(32 + bytes(name).length + bytes(separator).length);

        bytes memory data = abi.encodePacked(
          signature_prefix,
          message_length,
          identifier,
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
