function popReminder(condition = true) {
    if (!condition) return;
    popup = document.getElementById('reminder');
    if (!popup) return

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
}