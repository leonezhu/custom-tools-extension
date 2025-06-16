// 由于Chrome扩展的限制，这里使用传统的方式而不是ES6模块导入

(async function () {
  // 获取配置的函数
  function getConfig(site) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([site], (result) => {
        resolve(result[site] || {});
      });
    });
  }

  // 等待DOM加载完成
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 超时处理
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  try {
    const config = await getConfig('bilibili');
    if (!config.replacePlaceholder?.enabled) return;

    const newText = config.replacePlaceholder?.text || '输入你想看的内容...';
    
    // 等待搜索框元素出现
    const input = await waitForElement('.nav-search-input');
    if (input) {
      setTimeout(() => {
        input.placeholder = newText;
      }, 5000);
      
      console.log('Bilibili搜索框placeholder已替换为:', newText);
    } else {
      console.log('未找到Bilibili搜索框元素');
    }
  } catch (error) {
    console.error('Bilibili内容脚本执行错误:', error);
  }
})();