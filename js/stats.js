// js/stats.js — 共享统计工具函数
window.ImasStats = (function () {
    function mean(arr) {
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    function median(arr) {
        if (!arr.length) return 0;
        const s = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(s.length / 2);
        return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    }

    function std(arr, mu) {
        if (!arr.length) return 0;
        if (mu === undefined) mu = mean(arr);
        return Math.sqrt(arr.reduce((s, v) => s + (v - mu) ** 2, 0) / arr.length);
    }

    function getFieldValue(member, fieldName) {
        switch (fieldName) {
            case 'bust': return Array.isArray(member.three_sizes) ? member.three_sizes[0] : null;
            case 'waist': return Array.isArray(member.three_sizes) ? member.three_sizes[1] : null;
            case 'hip': return Array.isArray(member.three_sizes) ? member.three_sizes[2] : null;
            case 'bmi': return (member.height && member.weight) ? member.weight / ((member.height / 100) ** 2) : null;
            default: return member[fieldName] != null ? member[fieldName] : null;
        }
    }

    function filterActiveIdols(staff) {
        return staff.filter(m => !m['non-playable']);
    }

    function collectFieldValues(members, fieldName) {
        return members.map(m => getFieldValue(m, fieldName)).filter(v => v != null);
    }

    return { mean, median, std, getFieldValue, filterActiveIdols, collectFieldValues };
})();
