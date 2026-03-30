// js/chartConfig.js — 共享 ECharts 配置与常量
window.ImasCharts = (function () {
    var S = window.ImasStats;

    var PRODUCTION_COLORS = {
        'THE IDOLM@STER': '#f34f6d', '765AS': '#f34f6d',
        'CINDERELLA GIRLS': '#2681c8', 'CG': '#2681c8',
        'MILLION LIVE!': '#ffc30b', 'ML': '#ffc30b',
        'SideM': '#0fbe94',
        'SHINY COLORS': '#8dbbff', 'SC': '#8dbbff',
        'Gakuen': '#f39800', '学園': '#f39800',
        'Others': '#656a75',
        'All': '#ff74b8', 'ALL': '#ff74b8',
        'Active': '#656a75'
    };

    var KNOWN_FIELDS = {
        age: '年龄', height: '身高(cm)', weight: '体重(kg)',
        bust: '胸围(cm)', waist: '腰围(cm)', hip: '臀围(cm)',
        bmi: 'BMI', shoe_size: '鞋码(cm)', hand: '惯用手', blood: '血型', home: '出身地'
    };

    var DIMS_DEFAULT = ['age', 'height', 'weight', 'bust', 'waist', 'hip'];

    var DISTRIBUTION_BUCKETS = {
        age: [
            ['≤12岁', function (a) { return a <= 12; }],
            ['13-15岁', function (a) { return a > 12 && a <= 15; }],
            ['16-18岁', function (a) { return a > 15 && a <= 18; }],
            ['19-22岁', function (a) { return a > 18 && a <= 22; }],
            ['≥23岁', function (a) { return a > 22; }]
        ],
        height: [
            ['≤149cm', function (h) { return h <= 149; }],
            ['150-156cm', function (h) { return h > 149 && h <= 156; }],
            ['157-162cm', function (h) { return h > 156 && h <= 162; }],
            ['163-169cm', function (h) { return h > 162 && h <= 169; }],
            ['≥170cm', function (h) { return h > 169; }]
        ],
        weight: [
            ['≤35kg', function (w) { return w <= 35; }],
            ['36-40kg', function (w) { return w > 35 && w <= 40; }],
            ['41-45kg', function (w) { return w > 40 && w <= 45; }],
            ['46-50kg', function (w) { return w > 45 && w <= 50; }],
            ['51-55kg', function (w) { return w > 50 && w <= 55; }],
            ['≥56kg', function (w) { return w > 55; }]
        ],
        bust: [
            ['≤72cm', function (b) { return b <= 72; }],
            ['73-78cm', function (b) { return b > 72 && b <= 78; }],
            ['79-83cm', function (b) { return b > 78 && b <= 83; }],
            ['84-89cm', function (b) { return b > 83 && b <= 89; }],
            ['≥90cm', function (b) { return b > 89; }]
        ],
        waist: [
            ['≤54cm', function (w) { return w <= 54; }],
            ['55-58cm', function (w) { return w > 54 && w <= 58; }],
            ['59-62cm', function (w) { return w > 58 && w <= 62; }],
            ['63-67cm', function (w) { return w > 62 && w <= 67; }],
            ['≥68cm', function (w) { return w > 67; }]
        ],
        hip: [
            ['≤78cm', function (h) { return h <= 78; }],
            ['79-83cm', function (h) { return h > 78 && h <= 83; }],
            ['84-88cm', function (h) { return h > 83 && h <= 88; }],
            ['89-93cm', function (h) { return h > 88 && h <= 93; }],
            ['≥94cm', function (h) { return h > 93; }]
        ],
        shoe_size: [
            ['≤23cm', function (s) { return s <= 23; }],
            ['23.5-24.5cm', function (s) { return s > 23 && s <= 24.5; }],
            ['25-26cm', function (s) { return s > 24.5 && s <= 26; }],
            ['26.5-27.5cm', function (s) { return s > 26 && s <= 27.5; }],
            ['≥28cm', function (s) { return s > 27.5; }]
        ]
    };

    function radarBaseStyle(accentColor) {
        var c = accentColor || '#ff74b8';
        return {
            axisName: { color: '#333' },
            axisLine: { lineStyle: { color: c + '80', width: 1, type: 'solid' } },
            splitLine: { lineStyle: { color: c + '80', width: 1 } },
            splitArea: { show: true, areaStyle: { color: ['#0000', c + '20'] } }
        };
    }

    function getRadarOption(opts) {
        var style = radarBaseStyle(opts.accentColor);
        return {
            title: { text: opts.title || '平均属性', left: 'center', top: 10 },
            textStyle: { fontFamily: 'font-title', fontSize: 14 },
            tooltip: opts.tooltip || {},
            radar: Object.assign({
                shape: 'polygon', splitNumber: 5,
                center: ['50%', '55%'],
                indicator: opts.indicator
            }, style),
            series: [{
                type: 'radar',
                name: opts.seriesName || '',
                data: opts.data
            }]
        };
    }

    function getBarOption(opts) {
        return {
            title: { text: opts.title, left: 'center', top: 10 },
            textStyle: { fontFamily: 'font-title' },
            tooltip: opts.tooltip || { trigger: 'item' },
            xAxis: { show: false, data: opts.xLabels },
            yAxis: { type: 'value', min: opts.yMin },
            series: [{
                type: 'bar',
                data: opts.data,
                barWidth: '50%',
                label: {
                    show: true, position: 'top', fontWeight: 'bold',
                    formatter: opts.labelFormatter || function (p) { return p.value.toFixed(2); }
                }
            }]
        };
    }

    function getPieOption(opts) {
        var narrow = window.innerWidth <= 808;
        return {
            title: { text: opts.title, left: 'center', top: 10 },
            textStyle: { fontFamily: 'font-title', fontSize: 14 },
            tooltip: {
                trigger: 'item',
                formatter: function (p) { return p.name + '<br/>' + p.marker + p.value + '人<br/>' + p.marker + p.percent + '%'; }
            },
            legend: narrow ? { show: false } : {
                type: 'scroll', orient: 'vertical',
                left: 10, top: 20, bottom: 20,
                data: opts.data.map(function (d) { return d.name; })
            },
            series: [{
                type: 'pie',
                radius: opts.radius || '50%',
                center: narrow ? ['50%', '55%'] : ['50%', '50%'],
                data: opts.data,
                selectedMode: opts.selectedMode || 'multiple',
                selectedOffset: opts.selectedOffset != null ? opts.selectedOffset : 30,
                label: { formatter: opts.labelFormatter || '{b}（{d}%）' }
            }]
        };
    }

    function computeTypeStats(arr, types, dims) {
        dims = dims || DIMS_DEFAULT;
        var allDims = dims.concat(dims.indexOf('bmi') === -1 ? ['bmi'] : []);
        return types.map(function (t) {
            var sub = arr.filter(function (m) { return m.type === t; });
            var o = {};
            allDims.forEach(function (k) {
                var vals = S.collectFieldValues(sub, k);
                o[k] = S.mean(vals);
                o[k + '_median'] = S.median(vals);
                o[k + '_std'] = S.std(vals, o[k]);
            });
            return o;
        });
    }

    function bucketize(values, dist) {
        var buckets = DISTRIBUTION_BUCKETS[dist];
        if (!buckets) return [];
        var counts = buckets.map(function () { return 0; });
        values.forEach(function (v) {
            buckets.forEach(function (b, i) { if (b[1](v)) counts[i]++; });
        });
        return buckets.map(function (b, i) { return { name: b[0], value: counts[i] }; })
            .filter(function (d) { return d.value > 0; });
    }

    function setupChartResize() {
        var charts = Array.prototype.slice.call(arguments);
        window.addEventListener('resize', function () {
            charts.forEach(function (c) { if (c) c.resize(); });
        });
    }

    return {
        PRODUCTION_COLORS: PRODUCTION_COLORS,
        KNOWN_FIELDS: KNOWN_FIELDS,
        DIMS_DEFAULT: DIMS_DEFAULT,
        DISTRIBUTION_BUCKETS: DISTRIBUTION_BUCKETS,
        getRadarOption: getRadarOption,
        getBarOption: getBarOption,
        getPieOption: getPieOption,
        computeTypeStats: computeTypeStats,
        bucketize: bucketize,
        setupChartResize: setupChartResize
    };
})();
