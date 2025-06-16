export function getConfig(site) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([site], (result) => {
      resolve(result[site] || {});
    });
  });
}

export function setConfig(site, data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [site]: data }, resolve);
  });
}