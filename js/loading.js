(function () {
    const loader = document.getElementById('loading');
    window.addEventListener('load', function () {
        loader.style.opacity = 0;
    });
    setTimeout(function () {
        loader.style.display = 'none';
    }, 1000);
})();