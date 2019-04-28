module.exports = {
    getSignature: (abi, fname) => {
        return abi.find(fabi => fabi.name === fname).signature;
    }
}
