{
    const textEl = document.querySelector('#typing-text')
    const exEl = Array
        .from({ length: 6 }, (_, i) => document.getElementById(`ex-mark${i + 1}`))
        .filter(Boolean);

    const text = 'これからも、アイドル';
    let charIndex = 0;
    let time = 0;

    for (let i = 0; i < 10; ++i) {
        let interval = 375 - Math.random() * 200;
        setTimeout(function () {
            textEl.innerHTML = text.slice(0, ++charIndex);
        },
            time);
        time += interval;
    }

    for (let i = 0; i < 6; ++i) {
        let interval = 400 - Math.random() * 200;
        setTimeout(function () {
            exEl[i].innerHTML = '!';
        },
            time);
        time += interval;
    }
}