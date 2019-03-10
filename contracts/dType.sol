pragma solidity ^0.5.1;

contract dType{
    struct Type {
        string name;
        bytes32[] types;
        address contractAddress;
        bytes32 swarmId;
        uint256 index;
    }
    
    mapping(bytes32 => Type) private typeStruct;
    bytes32[] private typeIndex;
    
    
    function isType(bytes32 typeHash)
    public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[typeHash].index] == typeHash);
    }
    
    function insert(string memory name, bytes32[] memory types, address contractAddress, bytes32 swarmId)        
    public returns(uint256 index){
        bytes32 hash = keccak256(abi.encode(name, types));
        if(isType(hash)) revert("This type exists. Use the extant type."); 
        typeStruct[hash].name = name;
        typeStruct[hash].types = types;
        // typeStruct[hash].types = arrayOfEach(hash(type));
        typeStruct[hash].contractAddress = contractAddress;
        typeStruct[hash].swarmId = swarmId;
        typeStruct[hash].index = typeIndex.push(hash)-1;
        
        emit LogNew(
            hash, 
            typeStruct[hash].index, 
            name, 
            types);
        
        return typeIndex.length-1;
    }
    
    function getTypes(bytes32 hash) public view
    returns(bytes32[] memory types)
    {
        
        if (typeStruct[hash].types.length == 1 && hash == typeStruct[hash].types[0]) return typeStruct[hash].types; 
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
    returns(string memory name, bytes32[] memory types, uint256 index)
    {
        if(!isType(hash)) revert("No such type inserted."); 
        return(
            typeStruct[hash].name, 
            typeStruct[hash].types, 
            typeStruct[hash].index);
    }
    
    // function getByName
    
    
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
            typeStruct[hash].types);
            
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
            typeStruct[keyToMove].types);
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
    bytes32[] types);
    
    event LogUpdate(
    bytes32 indexed typeHash, 
    uint index, 
    string name, 
    bytes32[] types);
    
    event LogRemove(
    bytes32 indexed typeHash, 
    uint256 index);
    
    
    
}