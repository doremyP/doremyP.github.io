(function () {
    // 页面滚动
    function percent() {
        let a = document.documentElement.scrollTop, // 卷去高度
            vh = document.documentElement.clientHeight, // 可视高度
            b = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - vh, // 整个网页高度 减去 可视高度
            result = Math.max(Math.round(a / b * 100), 0), // 计算百分比
            btn = document.getElementById("go-up");

        if (b - a > 180) {
            btn.childNodes[1].style.display = 'none'
            btn.childNodes[2].style.display = 'block'
            btn.childNodes[2].innerHTML = result + '<span>%</span>';
        } else { // 如果大于95%就显示回到顶部图标
            btn.childNodes[2].style.display = 'none'
            btn.childNodes[1].style.display = 'block'
        }
    }
    percent();
    window.onscroll = percent;
})();
