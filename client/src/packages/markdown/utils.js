import {ethers} from 'ethers';

const getAliasesFromMd = (text) => {
    const included = {aliases: [], full: []};
    const links = {aliases: [], full: []};
    const arrayMatch = [...text.matchAll(/\[\[(.*?)\]\]/g)];

    arrayMatch.forEach((match) => {
        const endindex = match.index + match[0].length;
        if (text.substring(endindex, endindex + 2) === '()') {
            links.aliases.push(match[1]);
            links.full.push(`${match[0]}()`);
        } else {
            included.aliases.push(match[1]);
            included.full.push(match[0]);
        }
    });
    return {included, links};
};

const replaceAliasesMd = (text, aliases, replacements) => {
    aliases.forEach((match, i) => {
        text = text.replace(match, replacements[i]);
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
