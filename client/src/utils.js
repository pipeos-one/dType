export const waitAsync = async function (delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
};
