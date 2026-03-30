// js/toolPanel.js — 浮动工具按钮 + 图表筛选面板 + 返回按钮
// 在 branchPage.js / indexPage.js 之后加载
(function () {
    // 检查页面类型
    var modeToggle = document.getElementById('modeToggle');
    var filterContainer = document.getElementById('filter-container');
    var sideButtons = document.getElementById('side-buttons');
    var isIndex = window.location.pathname.replace(/.*\//, '') === 'index.html' || window.location.pathname.endsWith('/');
    var hasToolPanel = modeToggle || filterContainer;

    // ===== 创建返回按钮（非 index 页面） =====
    if (!isIndex) {
        var retBtn = document.createElement('button');
        retBtn.id = 'return-button';
        retBtn.title = '返回主页';
        retBtn.onclick = function () { window.location.href = './'; };
        retBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">' +
            '<path fill="#fff" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>' +
            '</svg>';
        if (sideButtons) {
            sideButtons.insertBefore(retBtn, sideButtons.firstChild);
        } else {
            document.body.appendChild(retBtn);
        }
    }

    if (!hasToolPanel) return;

    // ===== 创建工具按钮 =====
    var btn = document.createElement('button');
    btn.id = 'tool-button';
    btn.title = filterContainer ? '筛选设置' : '图表设置';
    btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="3"/>' +
        '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
        '</svg>';
    if (sideButtons) {
        sideButtons.insertBefore(btn, sideButtons.firstChild);
    } else {
        document.body.appendChild(btn);
    }

    // ===== 创建遮罩 =====
    var backdrop = document.createElement('div');
    backdrop.id = 'toolPanelBackdrop';
    document.body.appendChild(backdrop);

    // ===== 创建居中包裹层 =====
    var wrap = document.createElement('div');
    wrap.id = 'toolPanelWrap';
    backdrop.appendChild(wrap);

    // ===== 创建面板 =====
    var panel = document.createElement('div');
    panel.id = 'toolPanel';
    wrap.appendChild(panel);

    // ===== 创建面板内层滚动容器 =====
    var inner = document.createElement('div');
    inner.id = 'toolPanelInner';
    panel.appendChild(inner);

    // ===== 创建面板关闭按钮（面板下方） =====
    var panelClose = document.createElement('div');
    panelClose.className = 'panel-close';
    panelClose.innerHTML =
        '<img src="assets/img/icon_close.png" alt="关闭" class="close-off">' +
        '<img src="assets/img/icon_close_h.png" alt="关闭" class="close-hover">';
    wrap.appendChild(panelClose);

    // ===== 辅助：创建分区 =====
    function createSection(title) {
        var section = document.createElement('div');
        section.className = 'toolPanel-section';
        var h = document.createElement('div');
        h.className = 'toolPanel-section-title';
        h.textContent = title;
        section.appendChild(h);
        return section;
    }

    // ===== 移动控件到面板 =====
    if (modeToggle) {
        // Branch 页面模式
        // 1. 模式切换
        var modeSection = createSection('图表模式');
        modeSection.appendChild(modeToggle);
        inner.appendChild(modeSection);

        // 2. 数值设置（barChartBtns + barChartStaticBtns）
        var barBtns = document.getElementById('barChartBtns');
        var valueSection = null;
        if (barBtns) {
            valueSection = createSection('数值设置');
            if (barBtns) valueSection.appendChild(barBtns);

            inner.appendChild(valueSection);
        }
        var barStaticBtns = document.getElementById('barChartStaticBtns');
        var staticSection = null;
        if (barStaticBtns) {
            staticSection = createSection('统计量');
            staticSection.appendChild(barStaticBtns);
        }
        inner.appendChild(staticSection);


        // 3. 占比设置（distBtns + prodBtns）
        var distBtns = document.getElementById('distBtns');
        var ratioSection = null;
        if (distBtns) {
            ratioSection = createSection('占比设置');
            ratioSection.appendChild(distBtns);
            inner.appendChild(ratioSection);
        }
        var prodBtns = document.getElementById('prodBtns');
        var prodSection = null;
        if (prodBtns) {
            var prodTitle = window.BRANCH_CONFIG ? '类型' : '企划';
            prodSection = createSection(prodTitle);
            prodSection.appendChild(prodBtns);
            inner.appendChild(prodSection);
        }


        // 子分区显隐
        function updateSections() {
            var btnRadar = document.getElementById('btn-radar');
            var btnValue = document.getElementById('btn-value');
            var btnRatio = document.getElementById('btn-ratio');

            var radarActive = btnRadar && btnRadar.classList.contains('active');
            var valueActive = btnValue && btnValue.classList.contains('active');
            var ratioActive = btnRatio && btnRatio.classList.contains('active');

            var isValue = valueActive || (!radarActive && !ratioActive && !btnRadar);

            if (valueSection) {
                valueSection.style.display = isValue ? '' : 'none';
            }
            if (staticSection) {
                staticSection.style.display = isValue ? '' : 'none';
            }
            if (ratioSection) {
                ratioSection.style.display = ratioActive ? '' : 'none';
            }
            if (prodSection) {
                prodSection.style.display = ratioActive ? '' : 'none';
            }
        }

        modeToggle.addEventListener('click', function (e) {
            if (e.target.tagName === 'BUTTON') {
                setTimeout(updateSections, 10);
            }
        });

        updateSections();
    }

    // ===== All 页面模式：暴露面板供 allPage.js 填充 =====
    if (filterContainer) {
        window._toolPanel = inner;
        window._toolPanelCreateSection = createSection;
    }

    // ===== 开关逻辑 =====
    var isOpen = false;

    function togglePanel() {
        isOpen = !isOpen;
        backdrop.classList.toggle('open', isOpen);
        btn.classList.toggle('active', isOpen);
    }

    function closePanel() {
        if (!isOpen) return;
        isOpen = false;
        backdrop.classList.remove('open');
        btn.classList.remove('active');
    }

    btn.addEventListener('click', togglePanel);
    backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) closePanel();
    });
    panelClose.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePanel();
    });

    // ===== 图表 resize（仅 branch/index 页面需要） =====
    if (modeToggle) {
        backdrop.addEventListener('transitionend', function (e) {
            if (e.target === backdrop) {
                window.dispatchEvent(new Event('resize'));
            }
        });
    }
})();
