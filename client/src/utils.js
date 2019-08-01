export const waitAsync = async function(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
};

export const TYPE_PREVIEW = {
    markdown: (data) => {
        // return ethers.utils.toUtf8String(data.content);
        return data.content;
    },
    account: (data) => {
        return data.addr;
    },
    person: (data) => {
        console.log('TYPE_PREVIEW person', data);
        return data.fullname;
    },
};
