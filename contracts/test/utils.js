const getFuncAbi = (abi, fname) => {
    return abi.find(fabi => fabi.name === fname);
}

const getSignature = (abi, fname) => {
    return getFuncAbi(abi, fname).signature;
}

const getFuncOut = (abi, fname) => {
    return getFuncAbi(abi, fname).outputs;
}

const signatureDataInternal = (web3, chainId, address, dTypeIdentifier, hash, nonce, sep, name) => {
    nonce = web3.utils.numberToHex(nonce).substring(2);
    chainId = web3.utils.numberToHex(chainId).substring(2);

    const data = address.toLowerCase() +
        '0'.repeat(64 - chainId.length) + chainId +
        dTypeIdentifier.substring(2) +
        hash.substring(2) +
        '0'.repeat(16 - nonce.length) + nonce +
        sep.substring(2) +
        web3.utils.utf8ToHex(name).substring(2);

    return data;
}

module.exports = {
    getFuncAbi,
    getSignature,
    getFuncOut,
    signatureDataInternal,
}
