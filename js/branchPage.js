// js/branchPage.js — Parameterized chart logic for branch pages (sc, ml, cg, sidem)
// Depends on: window.ImasStats (js/stats.js), window.ImasCharts (js/chartConfig.js)
// Each page sets window.BRANCH_CONFIG before loading this script.
(function () {
    var config = window.BRANCH_CONFIG;
    if (!config) return;

    var S = window.ImasStats;
    var C = window.ImasCharts;

    var prodKey = config.prodKey;
    var seriesName = config.seriesName;
    var seriesColor = config.seriesColor;
    var types = config.types;
    var colors = config.colors;
    var dims = config.dims;
    var radarIndicator = config.radarIndicator;
    var barMins = config.barMins;
    var known = C.KNOWN_FIELDS;

    // Build distribution buckets: use config override or defaults
    var distBuckets;
    if (config.distBuckets) {
        distBuckets = {};
        var defaultBuckets = C.DISTRIBUTION_BUCKETS;
        var keys = Object.keys(defaultBuckets);
        for (var i = 0; i < keys.length; i++) {
            distBuckets[keys[i]] = config.distBuckets[keys[i]] || defaultBuckets[keys[i]];
        }
        var configKeys = Object.keys(config.distBuckets);
        for (var j = 0; j < configKeys.length; j++) {
            if (!distBuckets[configKeys[j]]) {
                distBuckets[configKeys[j]] = config.distBuckets[configKeys[j]];
            }
        }
    } else {
        distBuckets = C.DISTRIBUTION_BUCKETS;
    }

    fetch('data/c@st.min.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var all = data.flatMap(function (p) {
                return p.staff.map(function (m) {
                    return Object.assign({}, m, { production: p.production });
                });
            });

            var arr;
            if (Array.isArray(prodKey)) {
                arr = all.filter(function (m) {
                    return prodKey.indexOf(m.production) !== -1;
                });
            } else {
                arr = all.filter(function (m) {
                    return m.production === prodKey;
                });
            }
            arr = S.filterActiveIdols(arr);

            // ===== Radar Chart =====
            var avgAll = dims.map(function (k) {
                var vals = S.collectFieldValues(arr, k);
                return S.mean(vals);
            });
            avgAll.forEach(function (v, i) {
                avgAll[i] = v.toFixed(2);
            });

            var radarChart = echarts.init(document.getElementById('radarChart'));
            radarChart.setOption(C.getRadarOption({
                indicator: radarIndicator,
                seriesName: seriesName,
                data: [{
                    value: avgAll,
                    areaStyle: { color: seriesColor, opacity: 0.3 },
                    itemStyle: { color: seriesColor },
                    lineStyle: { color: seriesColor },
                    label: { show: true, fontWeight: 'bold' }
                }]
            }));
            // ===== Type-level Statistics =====
            var typeStats = C.computeTypeStats(arr, types, dims);

            // ===== Bar Chart =====
            var barChart = null;
            var field = 'age';
            var mode = 'mean';

            function drawBar() {
                var barEl = document.getElementById('barChart');
                if (!barChart) {
                    barChart = echarts.init(barEl);
                }
                barChart.resize();
                var values = types.map(function (t, i) {
                    return mode === 'mean' ? typeStats[i][field] : typeStats[i][field + '_median'];
                });
                barChart.setOption({
                    title: { text: known[field], left: 'center', top: 10 },
                    textStyle: { fontFamily: 'font-title' },
                    tooltip: {
                        trigger: 'item',
                        formatter: function (params) {
                            var idx = params.dataIndex;
                            var val = mode === 'mean' ? typeStats[idx][field] : typeStats[idx][field + '_median'];
                            var sigma = typeStats[idx][field + '_std'];
                            var modeLabel = mode === 'mean' ? '\u03bc' : 'Med';
                            return params.name + '<br/>' + params.marker + modeLabel + ' = ' + val.toFixed(2) + '<br/>' + params.marker + '\u03c3 = ' + sigma.toFixed(2);
                        }
                    },
                    xAxis: { show: false, data: types },
                    yAxis: { type: 'value', min: barMins[field] },
                    series: [{
                        type: 'bar',
                        data: values.map(function (v, i) {
                            return { value: v.toFixed(2), itemStyle: { color: colors[types[i]] } };
                        }),
                        barWidth: '50%',
                        label: { show: true, position: 'top', formatter: '{c}', fontWeight: 'bold' }
                    }]
                }, true);
            }

            document.querySelectorAll('#barChartBtns [data-field]').forEach(function (b) {
                b.addEventListener('click', function () {
                    document.querySelectorAll('#barChartBtns [data-field]').forEach(function (x) {
                        x.classList.remove('active');
                    });
                    b.classList.add('active');
                    field = b.getAttribute('data-field');
                    drawBar();
                });
            });

            var btnMean = document.getElementById('btn-mean');
            var btnMed = document.getElementById('btn-med');
            btnMean.addEventListener('click', function () {
                mode = 'mean';
                btnMed.classList.remove('active');
                btnMean.classList.add('active');
                drawBar();
            });
            btnMed.addEventListener('click', function () {
                mode = 'median';
                btnMean.classList.remove('active');
                btnMed.classList.add('active');
                drawBar();
            });

            // ===== Pie Chart =====
            var pieChart = null;
            var selTypes = [];
            var dist = 'age';

            function drawPie() {
                var pieEl = document.getElementById('distChart');
                if (!pieChart) {
                    pieChart = echarts.init(pieEl);
                }
                pieChart.resize();
                var subset = (selTypes.length === 0 || selTypes.length === types.length)
                    ? arr
                    : arr.filter(function (m) { return selTypes.indexOf(m.type) !== -1; });
                var pieData = [];

                if (dist === 'hand') {
                    var hc = {};
                    subset.forEach(function (m) {
                        if (m.handedness) hc[m.handedness] = (hc[m.handedness] || 0) + 1;
                    });
                    pieData = Object.entries(hc).map(function (entry) {
                        return { name: entry[0], value: entry[1] };
                    });
                } else if (dist === 'blood') {
                    var bc = {};
                    subset.forEach(function (m) {
                        if (m.blood_type) bc[m.blood_type] = (bc[m.blood_type] || 0) + 1;
                    });
                    pieData = Object.entries(bc).map(function (entry) {
                        return { name: entry[0], value: entry[1] };
                    });
                } else if (dist === 'home') {
                    var lc = {};
                    subset.forEach(function (m) {
                        if (m.hometown) lc[m.hometown] = (lc[m.hometown] || 0) + 1;
                    });
                    pieData = Object.entries(lc).map(function (entry) {
                        return { name: entry[0], value: entry[1] };
                    }).sort(function (a, b) { return b.value - a.value; });
                } else {
                    var buckets = distBuckets[dist];
                    if (buckets) {
                        var counts = buckets.map(function () { return 0; });
                        subset.forEach(function (m) {
                            var v = S.getFieldValue(m, dist);
                            if (v == null) return;
                            buckets.forEach(function (b, i) {
                                if (b[1](v)) counts[i]++;
                            });
                        });
                        pieData = buckets.map(function (b, i) {
                            return { name: b[0], value: counts[i] };
                        }).filter(function (d) { return d.value > 0; });
                    }
                }

                var pieOpts = { title: known[dist], data: pieData };
                if (dist === 'home') {
                    pieOpts.radius = ['50%', '70%'];
                    pieOpts.selectedMode = 'single';
                    pieOpts.selectedOffset = 0;
                }
                pieChart.setOption(C.getPieOption(pieOpts), true);
            }

            var prodBtnList = document.querySelectorAll('#prodBtns [data-type]');
            prodBtnList.forEach(function (b) {
                b.addEventListener('click', function () {
                    var t = b.getAttribute('data-type');
                    var idx = selTypes.indexOf(t);
                    if (idx !== -1) {
                        selTypes.splice(idx, 1);
                        b.classList.remove('active');
                    } else {
                        selTypes.push(t);
                        b.classList.add('active');
                    }
                    if (selTypes.length === types.length) {
                        selTypes = [];
                        prodBtnList.forEach(function (x) { x.classList.remove('active'); });
                    }
                    drawPie();
                });
            });

            document.querySelectorAll('#distBtns [data-dist]').forEach(function (b) {
                b.addEventListener('click', function () {
                    document.querySelectorAll('#distBtns [data-dist]').forEach(function (x) {
                        x.classList.remove('active');
                    });
                    b.classList.add('active');
                    dist = b.getAttribute('data-dist');
                    drawPie();
                });
            });

            // ===== Mode Toggle =====
            var modeButtons = document.querySelectorAll('#modeToggle button');
            function clearModeActive() {
                modeButtons.forEach(function (b) { b.classList.remove('active'); });
            }

            document.getElementById('btn-radar').addEventListener('click', function () {
                clearModeActive();
                document.getElementById('btn-radar').classList.add('active');
                document.getElementById('radarMode').style.display = 'block';
                document.getElementById('valueMode').style.display = 'none';
                document.getElementById('ratioMode').style.display = 'none';
                requestAnimationFrame(function () { radarChart.resize(); });
            });

            document.getElementById('btn-value').addEventListener('click', function () {
                clearModeActive();
                document.getElementById('btn-value').classList.add('active');
                document.getElementById('radarMode').style.display = 'none';
                document.getElementById('valueMode').style.display = 'block';
                document.getElementById('ratioMode').style.display = 'none';
                requestAnimationFrame(function () {
                    drawBar();
                });
            });

            document.getElementById('btn-ratio').addEventListener('click', function () {
                clearModeActive();
                document.getElementById('btn-ratio').classList.add('active');
                document.getElementById('radarMode').style.display = 'none';
                document.getElementById('valueMode').style.display = 'none';
                document.getElementById('ratioMode').style.display = 'block';
                requestAnimationFrame(function () {
                    drawPie();
                });
            });

            // ===== Resize Handlers =====
            window.addEventListener('resize', function () {
                if (document.getElementById('radarMode').style.display !== 'none') radarChart.resize();
                if (barChart && document.getElementById('valueMode').style.display !== 'none') barChart.resize();
                if (pieChart && document.getElementById('ratioMode').style.display !== 'none') pieChart.resize();
            });
        });
})();
