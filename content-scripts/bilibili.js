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
    
    // 禁用换一换按钮功能
    if (config.disableRollBtn?.enabled) {
      // 禁用按钮的函数
       function disableRollButton() {
         // 禁用固定的换一换按钮
         const rollBtns = document.querySelectorAll('.primary-btn.roll-btn');
         rollBtns.forEach(btn => {
           if (!btn.hasAttribute('data-disabled-by-extension')) {
             btn.disabled = true;
             btn.style.opacity = '0.5';
             btn.style.cursor = 'not-allowed';
             btn.style.pointerEvents = 'none';
             btn.setAttribute('data-disabled-by-extension', 'true');
             console.log('已禁用换一换按钮');
           }
         });
         
         // 禁用滚动时出现的flexible换一换按钮
         const flexibleRollBtns = document.querySelectorAll('.flexible-roll-btn');
         flexibleRollBtns.forEach(btn => {
           if (!btn.hasAttribute('data-disabled-by-extension')) {
             btn.style.opacity = '0.5';
             btn.style.cursor = 'not-allowed';
             btn.style.pointerEvents = 'none';
             btn.setAttribute('data-disabled-by-extension', 'true');
             console.log('已禁用flexible换一换按钮');
           }
         });
       }
      
      // 监听DOM变化，处理动态加载的按钮
      const rollBtnObserver = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            // 检查是否有新的换一换按钮被添加
             const addedNodes = Array.from(mutation.addedNodes);
             for (const node of addedNodes) {
               if (node.nodeType === Node.ELEMENT_NODE) {
                 if (node.classList?.contains('roll-btn') || 
                     node.classList?.contains('flexible-roll-btn') ||
                     node.querySelector?.('.roll-btn') ||
                     node.querySelector?.('.flexible-roll-btn')) {
                   shouldCheck = true;
                   break;
                 }
               }
             }
          }
        });
        
        if (shouldCheck) {
          setTimeout(disableRollButton, 100); // 延迟执行确保元素完全加载
        }
      });
      
      // 开始观察
      rollBtnObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // 禁用当前页面已存在的按钮
      disableRollButton();
      
      // 页面加载完成后再次检查
      setTimeout(disableRollButton, 2000);
    }
    
    // 隐藏动态页热搜功能 (针对 t.bilibili.com)
    if (config.hideDynamicTrending?.enabled && window.location.hostname === 't.bilibili.com') {
      let isDynamicTrendingHidden = false;
      
      // 隐藏动态页热搜的函数
      function hideDynamicTrending() {
        const stickySection = document.querySelector('section.sticky');
        if (stickySection && stickySection.style.display !== 'none' && !isDynamicTrendingHidden) {
          stickySection.style.display = 'none';
          isDynamicTrendingHidden = true;
          console.log('已隐藏动态页热搜');
        }
      }
      
      // 监听DOM变化，处理动态加载的热搜区域
      const dynamicTrendingObserver = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            for (const node of addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'SECTION' && node.classList?.contains('sticky') ||
                    node.querySelector?.('section.sticky')) {
                  shouldCheck = true;
                  break;
                }
              }
            }
          }
        });
        
        if (shouldCheck) {
          setTimeout(hideDynamicTrending, 100);
        }
      });
      
      // 开始观察
      dynamicTrendingObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // 隐藏当前页面已存在的热搜
      hideDynamicTrending();
      
      // 页面加载完成后再次检查
       setTimeout(hideDynamicTrending, 2000);
     }
     
     // 隐藏动态页直播功能 (针对 t.bilibili.com)
     if (config.hideLiveUsers?.enabled && window.location.hostname === 't.bilibili.com') {
       let isLiveUsersHidden = false;
       
       // 隐藏动态页直播的函数
       function hideLiveUsers() {
         const liveUsersDiv = document.querySelector('.bili-dyn-live-users');
         if (liveUsersDiv && liveUsersDiv.style.display !== 'none' && !isLiveUsersHidden) {
           liveUsersDiv.style.display = 'none';
           isLiveUsersHidden = true;
           console.log('已隐藏动态页直播');
         }
       }
       
       // 监听DOM变化，处理动态加载的直播区域
       const liveUsersObserver = new MutationObserver((mutations) => {
         let shouldCheck = false;
         mutations.forEach((mutation) => {
           if (mutation.type === 'childList') {
             const addedNodes = Array.from(mutation.addedNodes);
             for (const node of addedNodes) {
               if (node.nodeType === Node.ELEMENT_NODE) {
                 if (node.classList?.contains('bili-dyn-live-users') ||
                     node.querySelector?.('.bili-dyn-live-users')) {
                   shouldCheck = true;
                   break;
                 }
               }
             }
           }
         });
         
         if (shouldCheck) {
           setTimeout(hideLiveUsers, 100);
         }
       });
       
       // 开始观察
       liveUsersObserver.observe(document.body, {
         childList: true,
         subtree: true
       });
       
       // 隐藏当前页面已存在的直播区域
       hideLiveUsers();
       
       // 页面加载完成后再次检查
       setTimeout(hideLiveUsers, 2000);
     }
     
  } catch (error) {
    console.error("Bilibili内容脚本执行错误:", error);
  }
})();
