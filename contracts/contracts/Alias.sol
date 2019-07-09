pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;


contract Alias {
    // loredata.dataType1   // domain
    // chris@repoUsers      // person hash = address
    // topic#posts          // concept
    // something/dataType4  // hash ; compatible to move
    // hashItem/hashType 0x

    mapping (bytes => bytes32) public aliases;

    function setAlias(string memory name, string memory separator, bytes32 hash) public {
        require(checkCharExists(name, separator) == false, 'Name contains separator');
        bytes memory key = abi.encodePacked(name, separator);
        aliases[key] = hash;
    }

    function getAlias(string memory name, string memory separator) view public returns (bytes32 hash) {
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
}
