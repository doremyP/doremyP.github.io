{
    const bg = document.getElementById('bg');
    const bgstyle = ['imgblur 1.5s 1 ease-in-out', 'imgopa 3s'];
    bg.style.animation = bgstyle[Math.floor(Math.random() * bgstyle.length)];
    const btn = document.getElementById('title');
    btn.addEventListener('click', function () {
        bg.style.zIndex = 1000;
        setTimeout(function () {
            bg.style.zIndex = -1;
        }, 3000);
    });
}