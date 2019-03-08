pragma solidity ^0.5.1;

contract dType{
    struct Type {
        string name;
        string stype;
        bytes32[] types;
        address contractAddress;
        uint256 index;
    }
    
    mapping(bytes32 => Type) private typeStruct;
    bytes32[] private typeIndex;
    
    
    function isType(bytes32 typeHash)
    public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[typeHash].index] == typeHash);
    }
    
    function insert(string memory name, string memory stype, address contractAddress)        
    public returns(uint256 index){
        bytes32 hash = keccak256(abi.encode(stype));
        if(isType(hash)) revert("This type exists. Use the extant type."); 
        typeStruct[hash].name = name;
        typeStruct[hash].stype = stype;
        // typeStruct[hash].types = arrayOfEach(hash(type));
        typeStruct[hash].contractAddress = contractAddress;
        typeStruct[hash].index = typeIndex.push(hash)-1;
        
        emit LogNew(
            hash, 
            typeStruct[hash].index, 
            name, 
            stype);
        
        return typeIndex.length-1;
    }
    
    
    function getByHash(bytes32 hash) public view
    returns(string memory name, string memory stype, uint256 index)
    {
        if(!isType(hash)) revert("No such type inserted."); 
        return(
            typeStruct[hash].name, 
            typeStruct[hash].stype, 
            typeStruct[hash].index);
    }
    
    // function getByName
    
    
    function update(string memory name, string memory stype) 
    public returns(bool success) {
        bytes32 hash = keccak256(abi.encode(stype));
        if(!isType(hash)) revert("No such type inserted.");

        typeStruct[hash].name = name;
        typeStruct[hash].stype = stype;
        emit LogUpdate(
            hash,
            typeStruct[hash].index,
            name, 
            typeStruct[hash].stype);
            
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
            typeStruct[keyToMove].stype);
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
    string stype);
    
    event LogUpdate(
    bytes32 indexed typeHash, 
    uint index, 
    string name, 
    string stype);
    
    event LogRemove(
    bytes32 indexed typeHash, 
    uint256 index);
    
    
    
}