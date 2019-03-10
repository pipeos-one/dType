pragma solidity ^0.5.1;
pragma experimental ABIEncoderV2;

contract dType{
    struct Type {
        string name;
        bytes32[] types;
        bool isArray;
        address contractAddress;
        bytes32 source;
        uint256 index;
    }
    
    mapping(bytes32 => Type) private typeStruct;
    bytes32[] private typeIndex;
    mapping(string =>  bytes32[]) nameIndex;
    
    
    function isType(bytes32 typeHash)
    public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[typeHash].index] == typeHash);
    }
    
    function insert(string memory name, 
        // string memory ttype, 
        bytes32[] memory types, 
        bool isArray,
    address contractAddress, bytes32 source)        
    public returns(uint256 index){
        bytes32 hash = keccak256(abi.encode(name, types, isArray));
        if(isType(hash)) revert("This type exists. Use the extant type."); 
        typeStruct[hash].name = name;
        typeStruct[hash].types = types;
        typeStruct[hash].isArray = isArray;
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
            types,
            isArray);
        
        return typeIndex.length-1;
    }
    
    function getTypes(bytes32 hash) public view
    returns(bytes32[] memory types)
    {
        
        if (typeStruct[hash].types.length == 1 && typeStruct[hash].types[0] == 0x00) return typeStruct[hash].types; 
        bytes32[] memory ttypes;
        for (uint256 i = 0 ; i< typeStruct[hash].types.length; i++) {
            for (uint256 j =0 ; j< typeStruct[hash].types.length; j++) {
                ttypes[ttypes.length] = getTypes(typeStruct[hash].types[i])[j];
                //ttypes.length = ttypes.length + 1;
            }
        }
        return ttypes;
    }
    
    
    function get(string memory aname, string memory astype) public view
    returns(string memory name, bytes32[] memory types, uint256 index)
    {
        bytes32 hash = keccak256(abi.encode(aname, astype));
        return getByHash(hash);
        
    }
    
    
    function getByHash(bytes32 hash) public view
    returns(string memory name, 
        //string memory ttype, 
        bytes32[] memory types, uint256 index)
    {
        if(!isType(hash)) revert("No such type inserted."); 
        return(
            typeStruct[hash].name, 
            //typeStruct[hash].ttype,
            typeStruct[hash].types, 
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
    
    
    
    
    function update(string memory name, bytes32[] memory types, bool isArray) 
    public returns(bool success) {
        bytes32 hash = keccak256(abi.encode(name, types, isArray));
        if(!isType(hash)) revert("No such type inserted.");

        typeStruct[hash].name = name;
        typeStruct[hash].types = types;
        typeStruct[hash].isArray = isArray;
        emit LogUpdate(
            hash,
            typeStruct[hash].index,
            name, 
            typeStruct[hash].types,
            typeStruct[hash].isArray
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
            typeStruct[keyToMove].types,
            typeStruct[keyToMove].isArray
            );
        return rowToDelete;
    }
    
    function count() 
    public view returns(uint256 counter)
    {
        return typeIndex.length;
    }
    
    
    
    
    
    
    
    /** Events for application  */
    event LogNew (
    bytes32 indexed typeHash, 
    uint256 index, 
    string name, 
    bytes32[] types,
    bool isArray);
    
    event LogUpdate(
    bytes32 indexed typeHash, 
    uint index, 
    string name, 
    bytes32[] types,
    bool isArray);
    
    event LogRemove(
    bytes32 indexed typeHash, 
    uint256 index);
    
    
    
}