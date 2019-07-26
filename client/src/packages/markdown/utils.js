import {ethers} from 'ethers';

const getAliasesFromMd = (text) => {
    const arrayMatch = [...text.matchAll(/\[\[(.*?)\]\]/g)];
    return arrayMatch.map(match => match[1]);
};

const replaceAliasesMd = (text, aliases) => {
    const arrayMatch = [...text.matchAll(/\[\[(.*?)\]\]/g)];
    arrayMatch.forEach((match, i) => {
        text = text.replace(match[0], aliases[i]);
    });
    return text;
};

const TYPE_PREVIEW = {
    markdown: (data) => {
        return ethers.utils.toUtf8String(data.content);
    },
    account: (data) => {
        console.log('TYPE_PREVIEW account', data);
        return `\`${data.addr}\``;
    },
    person: (data) => {
        console.log('TYPE_PREVIEW person', data);
        return data.fullname;
    },
};

export {
    getAliasesFromMd,
    replaceAliasesMd,
    TYPE_PREVIEW,
}
