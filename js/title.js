(function () {
    const bg = document.getElementById('bg');
    const bgstyle = ['imgblur 2s 1 ease-in-out', 'imgopa 3s'];
    bg.style.animation = bgstyle[Math.floor(Math.random() * bgstyle.length)];
    const btn = document.getElementById('title');

    const container = document.getElementById('bodyContainer');
    btn.addEventListener('click', function () {
        container.style.opacity = 0;
        setTimeout(function () {
            bg.style.zIndex = 1000;
        }, 1000);
        setTimeout(function () {
            container.style.opacity = 1;
            bg.style.zIndex = -1;
        }, 4000);
    });
})();