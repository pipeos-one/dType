export const getAliasesFromMd = (text) => {
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

export const replaceAliasesMd = (text, aliases, replacements) => {
  aliases.forEach((match, i) => {
    text = text.replace(match, replacements[i]);
  });
  return text;
};

export const TYPE_PREVIEW = {
  markdown: (data) => {
    // return ethers.utils.toUtf8String(data.content);
    return data.content;
  },
  account: (data) => {
    return `\`${data.addr}\``;
  },
  person: (data) => {
    return data.fullname;
  },
  PhysicalAddress: (data) => {
    return Object.values(data).join(', ');
  },
};

export const typePreview = (dtypeName, data) => {
  if (!data) return '';

  if (TYPE_PREVIEW[dtypeName]) {
    return TYPE_PREVIEW[dtypeName](data);
  }
  return `\`${JSON.stringify(data)}\``;
};

export const enforceMaxLength = (cm, change) => {
  const maxLength = cm.getOption('maxLength');

  if (maxLength && change.update) {
    let str = change.text.join('\n');
    let delta = str.length - (cm.indexFromPos(change.to) - cm.indexFromPos(change.from));
    if (delta <= 0) { return true; }
    delta = cm.getValue().length + delta - maxLength;
    if (delta > 0) {
      str = str.substr(0, str.length - delta);
      change.update(change.from, change.to, str.split('\n'));
    }
  }
  return true;
};

export const previewRender = async (plainText, replaceAlias) => {
  const {included, links} = getAliasesFromMd(plainText);

  // Replace links before included aliases
  plainText = replaceAliasesMd(
    plainText,
    links.full,
    links.aliases.map(link => `[${link}](/#/alias?alias=${link})`),
  );
  const aliasobjs = await replaceAlias(included.aliases);
  plainText = replaceAliasesMd(plainText, included.full, aliasobjs);

  return plainText;
};
