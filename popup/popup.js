// 由于Chrome扩展的限制，这里使用传统的方式而不是ES6模块导入

// 存储工具函数
function getConfig(site) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([site], (result) => {
      resolve(result[site] || {});
    });
  });
}

function setConfig(site, data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [site]: data }, resolve);
  });
}

// 网站配置定义
const SITES = {
  bilibili: {
    label: 'Bilibili',
    features: [
      {
        key: 'replacePlaceholder',
        label: '替换搜索框提示',
        inputLabel: '自定义文案',
        default: '输入你想看的内容...'
      }
    ]
  }
};

// 显示状态消息
function showStatus(message, isError = false) {
  const existingStatus = document.querySelector('.status-message');
  if (existingStatus) {
    existingStatus.remove();
  }

  const statusDiv = document.createElement('div');
  statusDiv.className = `status-message ${isError ? 'status-error' : 'status-success'}`;
  statusDiv.textContent = message;
  
  document.querySelector('.container').appendChild(statusDiv);
  
  setTimeout(() => {
    if (statusDiv.parentNode) {
      statusDiv.remove();
    }
  }, 2000);
}

// 初始化页面
async function init() {
  const container = document.getElementById('site-config');

  try {
    for (const [siteKey, siteData] of Object.entries(SITES)) {
      const config = await getConfig(siteKey);

      const siteSection = document.createElement('div');
      siteSection.className = 'site-section';
      
      const siteTitle = document.createElement('h2');
      siteTitle.className = 'site-title';
      siteTitle.textContent = siteData.label;
      siteSection.appendChild(siteTitle);

      siteData.features.forEach(feature => {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';

        const enabled = config[feature.key]?.enabled ?? false;
        const value = config[feature.key]?.text ?? feature.default;

        featureItem.innerHTML = `
          <div class="feature-header">
            <input type="checkbox" class="feature-checkbox" data-site="${siteKey}" data-key="${feature.key}" ${enabled ? 'checked' : ''}>
            <label class="feature-label" for="checkbox-${siteKey}-${feature.key}">${feature.label}</label>
          </div>
          <input type="text" class="feature-input" data-site="${siteKey}" data-key="${feature.key}" value="${value}" placeholder="${feature.default}" ${!enabled ? 'disabled' : ''}>
        `;
        
        siteSection.appendChild(featureItem);
      });
      
      container.appendChild(siteSection);
    }

    // 添加事件监听器
    document.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
      checkbox.addEventListener('change', async (e) => {
        const site = e.target.dataset.site;
        const key = e.target.dataset.key;
        const enabled = e.target.checked;
        
        try {
          const current = await getConfig(site);
          current[key] = current[key] || {};
          current[key].enabled = enabled;
          
          await setConfig(site, current);
          
          // 更新对应的文本输入框状态
          const textInput = document.querySelector(`input[type=text][data-site="${site}"][data-key="${key}"]`);
          if (textInput) {
            textInput.disabled = !enabled;
          }
          
          showStatus(`${enabled ? '已启用' : '已禁用'}功能`);
        } catch (error) {
          console.error('保存配置失败:', error);
          showStatus('保存配置失败', true);
        }
      });
    });

    document.querySelectorAll('input[type=text]').forEach(textInput => {
      textInput.addEventListener('input', async (e) => {
        const site = e.target.dataset.site;
        const key = e.target.dataset.key;
        const text = e.target.value;
        
        try {
          const current = await getConfig(site);
          current[key] = current[key] || {};
          current[key].text = text;
          
          await setConfig(site, current);
        } catch (error) {
          console.error('保存配置失败:', error);
          showStatus('保存配置失败', true);
        }
      });
      
      // 防抖处理，避免频繁保存
      let saveTimeout;
      textInput.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          showStatus('配置已保存');
        }, 500);
      });
    });
    
  } catch (error) {
    console.error('初始化失败:', error);
    showStatus('初始化失败', true);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);