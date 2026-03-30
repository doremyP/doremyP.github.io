// js/opening.js — 动态注入 opening 动画 HTML
(function () {
    var container = document.getElementById('js-opening-top');
    if (!container) return;

    var images = [
        { desktop: 'assets/img/mv_shiny_photo.webp', mobile: 'assets/img/mv_shiny_photo_sp.webp' },
        { desktop: 'assets/img/mv_milli_photo.webp', mobile: 'assets/img/mv_milli_photo_sp.webp' },
        { desktop: 'assets/img/mv_765_photo.webp', mobile: 'assets/img/mv_765_photo_sp.webp' },
        { desktop: 'assets/img/mv_cin_photo.webp', mobile: 'assets/img/mv_cin_photo_sp.webp' },
        { desktop: 'assets/img/mv_sidem_photo.webp', mobile: 'assets/img/mv_sidem_photo_sp.webp' },
        { desktop: 'assets/img/mv_gak_photo.webp', mobile: 'assets/img/mv_gak_photo_sp.webp' }
    ];

    container.innerHTML = images.map(function (img) {
        return '<div class="opening-top__item"><picture>' +
            '<source srcset="' + img.desktop + '" media="(min-width:750px)">' +
            '<img src="' + img.mobile + '" alt="" fetchpriority="high">' +
            '</picture></div>';
    }).join('');
})();
