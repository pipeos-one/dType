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

export const getUIPackage = async (packageName) => {
  const pack = await import(
    /* webpackChunkName: 'dynamicComponent' */
    /* webpackMode: "lazy" */
    `../../../client/node_modules/@dtype/${packageName}-ui/dist/dtype-${packageName}-ui.common.js`
  ).catch(console.log);

  if (pack) {
    await import(
      /* webpackChunkName: 'dynamicComponent' */
      /* webpackMode: "lazy" */
      `../../../client/node_modules/@dtype/${packageName}-ui/dist/dtype-${packageName}-ui.css`
    ).catch(console.log);
  }

  return pack;
};
