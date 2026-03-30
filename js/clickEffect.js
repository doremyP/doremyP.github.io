(function () {
    document.addEventListener('click', function (e) {
        var box = document.createElement('div');
        box.className = 'cDecoBox anime';
        box.style.top = e.clientY + 'px';
        box.style.left = e.clientX + 'px';

        var ul = document.createElement('ul');
        for (var i = 0; i < 5; i++) {
            ul.appendChild(document.createElement('li'));
        }
        box.appendChild(ul);
        document.body.appendChild(box);

        ul.children[0].addEventListener('animationend', function () {
            box.remove();
        });
    });
})();
