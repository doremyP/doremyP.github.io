(function () {
    // 页面滚动
    function percent() {
        let a = document.documentElement.scrollTop, // 卷去高度
            vh = document.documentElement.clientHeight, // 可视高度
            b = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - vh, // 整个网页高度 减去 可视高度
            result = Math.round(a / b * 100), // 计算百分比
            btn = document.getElementById("go-up"),
            btn2 = document.getElementById("go-down"); // 获取按钮

        if (a > vh) {
            btn.style.boxShadow = '0 0 12px #6699ff';
            btn2.style.boxShadow = '0 0 12px #6699ff';
            document.getElementById("scroll-buttons").style.right = "10px";
        }
        else {
            document.getElementById("scroll-buttons").style.right = "-38px";
            btn.style.boxShadow = 'none';
            btn2.style.boxShadow = 'none';
        }

        if (b - a > 250) { // 如果阅读进度小于95% 就显示百分比
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
