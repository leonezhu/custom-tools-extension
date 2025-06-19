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
        subtree: true,
      });

      // 超时处理
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  try {
    const config = await getConfig("bilibili");
    
    // 替换搜索框placeholder功能
    if (config.replacePlaceholder?.enabled) {
      const newText = config.replacePlaceholder?.text || "输入你想看的内容...";

      // 等待搜索框元素出现，支持多种选择器
      const selectors = [
        ".nav-search-input", // 主站搜索框
        ".search-input-el", // 部分页面的搜索框
        'input[placeholder*="搜索"]', // 通用搜索框
        ".search-input", // 备用选择器
        'input[type="text"][class*="search"]', // 更通用的搜索框
      ];

      let input = null;
      for (const selector of selectors) {
        input = await waitForElement(selector, 5000);
        if (input) break;
      }

      if (input) {
        setTimeout(() => {
          input.placeholder = newText;
          console.log("Bilibili搜索框placeholder已替换为:", newText);
        }, 3000);
      } else {
        console.log("未找到Bilibili搜索框元素，尝试的选择器:", selectors);
      }
    }
    
    // 隐藏热搜功能
    if (config.hideTrending?.enabled) {
      let isHidden = false; // 添加状态标记
      
      // 隐藏trending的函数
      function hideTrending() {
        const searchPanel = document.querySelector('.search-panel');
        if (searchPanel && searchPanel.style.display !== 'none') {
          const trendingDiv = searchPanel.querySelector('.trending');
          if (trendingDiv && trendingDiv.style.display !== 'none' && !isHidden) {
            trendingDiv.style.display = 'none';
            isHidden = true;
            console.log('已隐藏Bilibili热搜');
          }
        } else {
          isHidden = false; // 搜索面板关闭时重置状态
        }
      }
      
      // 更精确的监听
      const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach((mutation) => {
          // 只在特定变化时检查
          if (mutation.type === 'childList' && 
              (mutation.target.classList.contains('search-panel') || 
               mutation.target.querySelector('.search-panel'))) {
            shouldCheck = true;
          }
        });
        
        if (shouldCheck) {
          hideTrending();
        }
      });
      
      // 监听更具体的区域
      const navSearch = document.querySelector('.nav-search') || document.body;
      observer.observe(navSearch, {
        childList: true,
        subtree: true
      });
      
      // 检查现有面板
      hideTrending();
    }
    
  } catch (error) {
    console.error("Bilibili内容脚本执行错误:", error);
  }
})();
