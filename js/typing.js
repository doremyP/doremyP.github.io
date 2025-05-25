(function () {
    // これからも、アイドル!!!!!!
    const textFrontEl = document.getElementById('typing-front')
    const textInternalMarkEl = document.getElementById('typing-intermark')
    const textInternalEl = document.getElementById('typing-internal')
    const textRearEl = document.getElementById('typing-rear')
    const textMarkEl = document.getElementById('typing-mark')

    const exEl = Array
        .from({ length: 6 }, (_, i) => document.getElementById(`ex-mark${i + 1}`))
        .filter(Boolean);

    const text = 'これからも、アイドル';

    let time = 0;

    for (let i = 0; i <= 16; ++i) {
        let interval = 375 - Math.random() * 200;

        if (i < 6) {
            setTimeout(function () {
                textFrontEl.innerHTML = text.slice(0, i);
            },
                time);
        }
        if (i < 7) {
            setTimeout(function () {
                textInternalMarkEl.innerHTML = text.slice(5, i);
            },
                time);
        }
        if (i < 10) {
            setTimeout(function () {
                textInternalEl.innerHTML = text.slice(6, i);
            },
                time);
        }
        else if (i < 11) {
            setTimeout(function () {
                textRearEl.innerHTML = text.slice(9, i);
                textMarkEl.style.marginLeft = '14px';
            },
                time);
        }
        else if (i < 16) {
            setTimeout(function () {
                exEl[i - 11].innerHTML = '！';
            },
                time);
        }
        else {
            setTimeout(function () {
                exEl[i - 11].innerHTML = '！';
                textMarkEl.style.animation = 'typing-blink .8s step-end 6';
                textMarkEl.style.borderColor = 'transparent';
            },
                time);
        }
        time += interval;
    }

    // 页面滚动
    function percent() {
        let a = document.documentElement.scrollTop, // 卷去高度
            vh = document.documentElement.clientHeight, // 可视高度
            b = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - vh, // 整个网页高度 减去 可视高度
            result = Math.round(a / b * 100), // 计算百分比
            btn = document.getElementById("go-up"); // 获取按钮

        if (a > vh) {
            document.getElementById("rightside").style.right = "-48px";
        }
        else {
            document.getElementById("rightside").style.right = "-96px";
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
