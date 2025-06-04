(function () {
    const bg = document.getElementById('bg');
    let images = bg.dataset.img.split(',');
    let idx = Math.floor(Math.random() * images.length);
    bg.src = 'assets/img/' + images[idx];
    bg.style.animation = 'imgopa 3s';

    if (idx !== 0) return;

    popup = document.getElementById('reminder');
    if (!popup) return

    // 设置弹出框
    var showDelay = 500;
    var visibleDuration = 5000;
    var hideTimer;

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