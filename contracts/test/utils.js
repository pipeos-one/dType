const getFuncAbi = (abi, fname) => {
    return abi.find(fabi => fabi.name === fname);
}

const getSignature = (abi, fname) => {
    return getFuncAbi(abi, fname).signature;
}

const getFuncOut = (abi, fname) => {
    return getFuncAbi(abi, fname).outputs;
}

module.exports = {
    getFuncAbi,
    getSignature,
    getFuncOut,
}
