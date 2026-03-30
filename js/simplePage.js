// js/simplePage.js — Parameterized radar-only page script
// Depends on window.ImasStats (js/stats.js) and window.ImasCharts (js/chartConfig.js)
// Each page sets window.SIMPLE_CONFIG before loading this script.
(function () {
    const cfg = window.SIMPLE_CONFIG;
    if (!cfg) return;

    const S = window.ImasStats;
    const C = window.ImasCharts;
    const dims = cfg.dims || ['age', 'height', 'weight', 'bust', 'waist', 'hip'];

    fetch('data/c@st.min.json')
        .then(res => res.json())
        .then(data => {
            let members;

            if (cfg.mergeProductions != null) {
                // Merge mode (others.html): flatten all productions, re-tag matching ones
                const mergeSet = cfg.mergeProductions.concat(cfg.prodKey);
                members = data.flatMap(prod => {
                    const key = mergeSet.includes(prod.production) ? cfg.prodKey : prod.production;
                    return prod.staff.map(mem => ({ ...mem, production: key }));
                })
                    .filter(mem => mem.production === cfg.prodKey);
                members = S.filterActiveIdols(members);
            } else {
                // Single production mode (765as.html, gk.html)
                const prod = data.find(p => p.production === cfg.prodKey);
                members = prod ? S.filterActiveIdols(prod.staff) : [];
            }

            // Compute averages for each dimension
            const avg = {};
            dims.forEach(d => {
                avg[d] = S.mean(S.collectFieldValues(members, d));
            });

            // Build radar value array
            const values = dims.map(d => +avg[d].toFixed(2));

            // Initialize chart
            const chart = echarts.init(document.getElementById('radarChart'));
            chart.setOption(C.getRadarOption({
                indicator: cfg.radarIndicator,
                seriesName: cfg.seriesName,
                tooltip: {},
                data: [{
                    value: values,
                    name: cfg.seriesName,
                    itemStyle: { color: cfg.seriesColor },
                    areaStyle: { color: cfg.seriesColor, opacity: 0.3 },
                    lineStyle: { color: cfg.seriesColor },
                    label: {
                        show: true,
                        formatter: ({ value }) => value.toFixed(2),
                        fontWeight: 'bold'
                    }
                }]
            }));

            // Resize handler
            window.addEventListener('resize', () => {
                chart.resize();
            });
        });
})();
