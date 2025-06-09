(function () {
    const bg = document.getElementById('bg');
    let images = bg.dataset.img.split(',');
    let idx = Math.floor(Math.random() * images.length);
    bg.src = 'assets/img/' + images[idx];
})();