{
    let images = [
        '76823812_p0.png',
        '961pro.png',
        '0614e4c3-a7e0-45ab-852a-9ba405cd1fa0.png'
    ];
    let idx = Math.floor(Math.random() * images.length);
    document.getElementById('bg').src = 'assets/img/' + images[idx];
    if (idx === 0) {
        // sidebar-popup.js
        // 纯 JS 实现侧边弹窗，弹窗内容为两个带链接的标题与一个链接文字
        (function () {
            var showDelay = 500;       // 页面加载后自动显示延迟（毫秒）
            var visibleDuration = 5000; // 自动隐藏前的停留时间（毫秒）
            var hideTimer;
            var popup;

            // 创建并插入弹窗节点及样式
            function createPopup() {
                popup = document.createElement('div');
                popup.id = "reminder";
                // 弹窗内容：两个 h3 链接 + 一个普通链接
                var contentHTML = '' +
                    '<h3 style="margin:0px;">背景图作者：<a href="https://www.pixiv.net/users/3135839" target="_blank" class="reminder">HINA</a></h3>' +
                    '<h3 style="margin:8px 0 4px;">原图链接：</h3>' +
                    '<a href="https://www.pixiv.net/artworks/76823812" target="_blank" class="reminder">https://www.pixiv.net/artworks/76823812</a>';
                popup.insertAdjacentHTML('beforeend', contentHTML);

                document.body.appendChild(popup);

                // 事件绑定
                popup.addEventListener('mouseenter', function () {
                    clearTimeout(hideTimer);
                });
                popup.addEventListener('mouseleave', startHideTimer);
            }

            // 显示弹窗并启动隐藏计时
            function showPopup() {
                if (!popup) createPopup();
                requestAnimationFrame(function () {
                    popup.style.right = '0';
                });
                startHideTimer();
            }

            // 隐藏弹窗并移除节点
            function hidePopup() {
                if (!popup) return;
                popup.style.right = '-340px';
                popup.addEventListener('transitionend', function onEnd() {
                    popup.removeEventListener('transitionend', onEnd);
                    popup.parentNode.removeChild(popup);
                    popup = null;
                });
            }

            // 启动或重置隐藏计时器
            function startHideTimer() {
                clearTimeout(hideTimer);
                hideTimer = setTimeout(hidePopup, visibleDuration);
            }
            setTimeout(showPopup, showDelay);
        })();

    }
}