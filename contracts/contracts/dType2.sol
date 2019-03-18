pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypeLib.sol';

contract dType{

    using dTypeLib for dTypeLib.Type1;
    address rootContract;

    enum LangChoices { Solidity, JavaScript, Python }
    LangChoices constant defaultLang = LangChoices.Solidity;
    struct Type {
        dTypeLib.Type1 data;
        uint256 index;
    }

    mapping(bytes32 => Type) public typeStruct;
    bytes32[] public typeIndex;
    mapping(string =>  bytes32[]) nameIndex;
    mapping(bytes32 =>  bytes32[]) typesIndex;
    mapping(bytes32 => bytes32[]) outputIndex;

    function getIndex() public view returns(bytes32[] memory indext)
    {
        return typeIndex;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 hash, uint256 indexed index);
    event LogRemove(bytes32 hash, uint256 indexed index);


    function setRootContract(address rootC) public {
        rootContract = rootC;
    }

    function getRootContract() public view returns (address rootC) {
        return rootContract;
    }

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }
    /*
    function test1(uint256 bl, address a) public {
        dType.Type1 memory ty = dType.Type1(bl, a);
        insert(ty);
    }
*/
    function insert(dTypeLib.Type1 memory data) public returns (bytes32 hasho, uint256 index) {

        // for data integrity
        bytes32 hash = keccak256(abi.encode(data));

        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data = data;
        typeStruct[hash].index = typeIndex.push(hash) - 1;
        emit LogNew(hash, typeStruct[hash].index);
        return (hash, typeStruct[hash].index);
       /* */
    }

    function get(bytes32 hash) public view returns(dTypeLib.Type1 memory data) {
        if(!isStored(hash)) revert("No such data inserted.");
        return(typeStruct[hash].data);
    }

    function remove(bytes32 hash) public returns(uint256 index) {
        if(!isStored(hash)) revert("Not deleted: not extant.");
        uint rowToDelete = typeStruct[hash].index;
        bytes32 keyToMove = typeIndex[typeIndex.length-1];
        typeIndex[rowToDelete] = keyToMove;
        typeStruct[keyToMove].index = rowToDelete;
        typeIndex.length--;
        emit LogRemove(hash, rowToDelete);

        emit LogUpdate(keyToMove, rowToDelete);
        return rowToDelete;
    }

    function update(bytes32 hashi, dTypeLib.Type1 memory data)
        public
        returns(bytes32 hash, uint256 index)
    {
        remove(hashi);
        return insert(data);
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }



    function isType(bytes32 typeHash)
    public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[typeHash].index] == typeHash);
    }

    /*
    function insert(string memory name,
        // string memory ttype,
        bytes32[] memory types,
    address contractAddress, bytes32 source)
    public returns(uint256 index){
        bytes32 hash = keccak256(abi.encode(name, types));
        if(isType(hash)) revert("This type exists. Use the extant type.");
        for (uint256 i =0 ; i< types.length; i++){
            if (!isType(types[i]) && types[i] != bytes32(0x0)) revert("A type in the composition does not exists. Use only extant types.");
        }
        typeStruct[hash].name = name;
        typeStruct[hash].types = types;
        bytes32 hash2 = keccak256(abi.encode(types));
        typesIndex[hash2].push(hash);
        //typeStruct[hash].ttype = ttype;
        // typeStruct[hash].types = arrayOfEach(hash(type));
        typeStruct[hash].contractAddress = contractAddress;
        typeStruct[hash].source = source;
        typeStruct[hash].index = typeIndex.push(hash)-1;

        nameIndex[name].push(hash);

        emit LogNew(
            hash,
            typeStruct[hash].index,
            name,
            types);

        return typeIndex.length-1;
    }

    */

    function getTypes(bytes32 hash) public view
    returns(bytes32[] memory types)
    {

        if (typeStruct[hash].data.types.length == 1 && typeStruct[hash].data.types[0] == 0x00) return typeStruct[hash].data.types;
        bytes32[] memory ttypes;
        for (uint256 i = 0 ; i< typeStruct[hash].data.types.length; i++) {
            for (uint256 j =0 ; j< typeStruct[hash].data.types.length; j++) {
                ttypes[ttypes.length] = getTypes(typeStruct[hash].data.types[i])[j];
                //ttypes.length = ttypes.length + 1;
            }
        }
        return ttypes;
    }
    function ggetTypes(bytes32 hash) public view
    returns(bytes32[] memory types)
    {
        return typeStruct[hash].data.types;
    }


    function get(string memory aname, string memory astype) public view
    returns(string memory name, bytes32[] memory types, uint256 index)
    {
        bytes32 hash = keccak256(abi.encode(aname, astype));
        return getByHash(hash);

    }

    function r_count(bytes32 hash) public view returns(uint256 r_counter){
        dType r_contract = dType(typeStruct[hash].data.contractAddress);
        return r_contract.count();
    }


    function getByHash(bytes32 hash) public view
    returns(string memory name,
        //string memory ttype,
        bytes32[] memory types, uint256 index)
    {
        if(!isType(hash)) revert("No such type inserted.");
        return(
            typeStruct[hash].data.name,
            //typeStruct[hash].ttype,
            typeStruct[hash].data.types,
            typeStruct[hash].index);
    }


    function getByIndex(uint256 index) public view
    returns(Type memory atype, bytes32 hash)
    {
        if(index > typeIndex.length ) revert("Index too big.");
        return (typeStruct[typeIndex[index]],  typeIndex[index]);
    }

    function getByName(string memory name) public view returns(bytes32[] memory types)
    {
        return nameIndex[name];
    }


     /*

    function update(string memory name, bytes32[] memory types)
    public returns(bool success) {
        bytes32 hash = keccak256(abi.encode(name, types));
        if(!isType(hash)) revert("No such type inserted.");

        typeStruct[hash].name = name;
        typeStruct[hash].types = types;
        emit LogUpdate(
            hash,
            typeStruct[hash].index,
            name,
            typeStruct[hash].types
            );

        return true;
    }

    function remove(bytes32 hash)
    public returns(uint256 index)
    {
        if(!isType(hash)) revert("Not deleted because not extant.");
        uint rowToDelete = typeStruct[hash].index;
        bytes32 keyToMove = typeIndex[typeIndex.length-1];
        typeIndex[rowToDelete] = keyToMove;
        typeStruct[keyToMove].index = rowToDelete;
        typeIndex.length--;
        emit LogRemove(hash, rowToDelete);

        emit LogUpdate(
            keyToMove,
            rowToDelete,
            typeStruct[keyToMove].name,
            typeStruct[keyToMove].types
            );
        return rowToDelete;
    }


    function count()
    public view returns(uint256 counter)
    {
        return typeIndex.length;
    }
    */






    /** Events for application  */
    event LogNew (
    bytes32 indexed typeHash,
    uint256 index,
    string name,
    bytes32[] types);

    event LogUpdate(
    bytes32 indexed typeHash,
    uint index,
    string name,
    bytes32[] types);





}
