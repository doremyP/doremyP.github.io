function waitForOpeningFinish(callback) {
    var el = document.querySelector('#js-opening-top');
    if (!el || el.classList.contains('is-finish')) { callback(); return; }
    document.addEventListener('openingFinish', callback, { once: true });
}

function popBirthdayReminders(roles) {
    if (!roles || roles.length === 0) return;

    waitForOpeningFinish(function () {
        roles.forEach(function (role, index) {
            var reminder = document.createElement('div');
            reminder.className = 'birthday-reminder';
            reminder.style.top = (10 + index * 14) + '%';

            var month = parseInt(role.birthday.slice(0, 2));
            var day = parseInt(role.birthday.slice(2));
            var color = role.image_color ? role.image_color : "#ffffffc0";
            var border = role.image_color ? '1px solid ' + color : 'none';
            reminder.innerHTML =
                '<img src="' + (role.img || '') + '" alt="' + role.name + '" style="border: ' + border + ';box-shadow:0 0 12px ' + color + '" class="birthday-avatar" />' +
                '<div class="birthday-info">' +
                '<div style="text-shadow: 0 0 8px ' + color + '" class="birthday-name">' + role.name + '</div>' +
                '<div class="birthday-msg">' + month + '月' + day + '日 お誕生日おめでとう！🎉</div>' +
                '</div>';
            document.body.appendChild(reminder);

            var showDelay = 600 + index * 600;
            var hideDelay = 6000;
            var hideTimer;

            setTimeout(function () {
                reminder.classList.add('show');
                hideTimer = setTimeout(function () { reminder.classList.remove('show'); }, hideDelay);
            }, showDelay);

            reminder.addEventListener('mouseenter', function () {
                clearTimeout(hideTimer);
                reminder.classList.add('show');
            });
            reminder.addEventListener('mouseleave', function () {
                hideTimer = setTimeout(function () { reminder.classList.remove('show'); }, hideDelay);
            });
        });
    });
}
