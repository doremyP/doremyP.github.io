(function () {
    const bg = document.getElementById('bg');
    let images = bg.dataset.img.split(',');
    let idx = Math.floor(Math.random() * images.length);
    bg.src = 'assets/img/' + images[idx];
    bg.style.animation = 'imgopa 3s';

    if (idx !== 0) return;

    popup = document.getElementById('reminder');
    if (!popup) return

    var showDelay = 500;       // 页面加载后自动显示延迟（毫秒）
    var visibleDuration = 5000; // 自动隐藏前的停留时间（毫秒）
    var hideTimer;

    // 事件绑定
    popup.addEventListener('mouseenter', function () {
        clearTimeout(hideTimer);
        popup.style.right = '0';
    });
    popup.addEventListener('mouseleave', function () {
        hideTimer = setTimeout(hidePopup, visibleDuration);
    });

    function hidePopup() {
        popup.style.right = '-340px';
    }

    setTimeout(function () {
        popup.style.right = '0';
        hideTimer = setTimeout(hidePopup, visibleDuration);
    }, showDelay);
}())