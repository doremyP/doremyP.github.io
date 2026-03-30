(function () {
    var calcMean = ImasStats.mean;
    var calcMedian = ImasStats.median;
    var calcStd = ImasStats.std;

    fetch('data/c@st.min.json')
        .then(res => res.json())
        .then(data => {
            const known = {
                "THE IDOLM@STER": "765AS",
                "CINDERELLA GIRLS": "CG",
                "MILLION LIVE!": "ML",
                "SideM": "SideM",
                "SHINY COLORS": "SC",
                "Gakuen": "学園"
            };
            const colors = {
                "765AS": "#f34f6d",
                "CG": "#2681c8",
                "ML": "#ffc30b",
                "SideM": "#0fbe94",
                "SC": "#8dbbff",
                "学園": "#f39800",
                "Others": "#656a75",
                "All": "#ff74b8"
            };
            const prods = Object.keys(known);

            let stats = {}, bmiStats = {}, hometownCounts = {}, handedCounts = {}, bloodCounts = {};
            prods.forEach(p => {
                stats[p] = { ages: [], heights: [], weights: [], busts: [], waists: [], hips: [] };
                bmiStats[p] = [];
                hometownCounts[p] = {};
                handedCounts[p] = {};
                bloodCounts[p] = {};
            });
            stats['Others'] = { ages: [], heights: [], weights: [], busts: [], waists: [], hips: [] };
            bmiStats['Others'] = [];
            hometownCounts['Others'] = {};
            handedCounts['Others'] = {};
            bloodCounts['Others'] = {};
            let allAgesWithoutSideM = [], allHeightsWithoutSideM = [];

            data.forEach(prod => {
                prod.staff.forEach(mem => {
                    if (mem['non-playable']) return;
                    const key = prods.includes(prod.production) ? prod.production : 'Others';
                    const s = stats[key];

                    if (mem.age != null) {
                        s.ages.push(mem.age);
                        if (key !== 'SideM') allAgesWithoutSideM.push(mem.age);
                    }
                    if (mem.height != null) {
                        s.heights.push(mem.height);
                        if (key !== 'SideM') allHeightsWithoutSideM.push(mem.height);
                    }
                    if (mem.weight != null) s.weights.push(mem.weight);
                    if (Array.isArray(mem.three_sizes)) {
                        const [b, w, h] = mem.three_sizes;
                        if (b != null) s.busts.push(b);
                        if (w != null) s.waists.push(w);
                        if (h != null) s.hips.push(h);
                    }
                    if (typeof mem.height === 'number' && !isNaN(mem.height) && typeof mem.weight === 'number' && !isNaN(mem.weight)) {
                        bmiStats[key].push(mem.weight / ((mem.height / 100) ** 2));
                    }
                    if (mem.hometown != null) {
                        hometownCounts[key][mem.hometown] = (hometownCounts[key][mem.hometown] || 0) + 1;
                    }
                    if (mem.handedness != null) {
                        handedCounts[key][mem.handedness] = (handedCounts[key][mem.handedness] || 0) + 1;
                    }
                    if (mem.blood_type != null) {
                        bloodCounts[key][mem.blood_type] = (bloodCounts[key][mem.blood_type] || 0) + 1;
                    }
                });
            });

            let avg = {}, medianData = {}, stdData = {};
            Object.entries(stats).forEach(([key, s]) => {
                avg[key] = {
                    age: calcMean(s.ages), height: calcMean(s.heights), weight: calcMean(s.weights),
                    bust: calcMean(s.busts), waist: calcMean(s.waists), hip: calcMean(s.hips)
                };
                medianData[key] = {
                    age: calcMedian(s.ages), height: calcMedian(s.heights), weight: calcMedian(s.weights),
                    bust: calcMedian(s.busts), waist: calcMedian(s.waists), hip: calcMedian(s.hips)
                };
                stdData[key] = {
                    age: calcStd(s.ages, avg[key].age), height: calcStd(s.heights, avg[key].height),
                    weight: calcStd(s.weights, avg[key].weight), bust: calcStd(s.busts, avg[key].bust),
                    waist: calcStd(s.waists, avg[key].waist), hip: calcStd(s.hips, avg[key].hip)
                };
            });
            Object.entries(bmiStats).forEach(([key, arr]) => {
                const m = calcMean(arr), md = calcMedian(arr), sd = calcStd(arr, m);
                avg[key].bmi = m; medianData[key].bmi = md; stdData[key].bmi = sd;
            });

            const allKeysForBar = ['Others', ...prods.filter(p => p !== 'SideM')];
            const allKeysForPie = ['Others', ...prods];
            let combined = { ages: [], heights: [], weights: [], busts: [], waists: [], hips: [] };
            allKeysForBar.forEach(k => {
                combined.ages = combined.ages.concat(stats[k].ages);
                combined.heights = combined.heights.concat(stats[k].heights);
                combined.weights = combined.weights.concat(stats[k].weights);
                combined.busts = combined.busts.concat(stats[k].busts);
                combined.waists = combined.waists.concat(stats[k].waists);
                combined.hips = combined.hips.concat(stats[k].hips);
            });
            const meanAll = {
                age: calcMean(combined.ages), height: calcMean(combined.heights), weight: calcMean(combined.weights),
                bust: calcMean(combined.busts), waist: calcMean(combined.waists), hip: calcMean(combined.hips)
            };
            const medianAll = {
                age: calcMedian(combined.ages), height: calcMedian(combined.heights), weight: calcMedian(combined.weights),
                bust: calcMedian(combined.busts), waist: calcMedian(combined.waists), hip: calcMedian(combined.hips)
            };
            const stdAll = {
                age: calcStd(combined.ages, meanAll.age), height: calcStd(combined.heights, meanAll.height),
                weight: calcStd(combined.weights, meanAll.weight), bust: calcStd(combined.busts, meanAll.bust),
                waist: calcStd(combined.waists, meanAll.waist), hip: calcStd(combined.hips, meanAll.hip)
            };
            const allBmiArr = allKeysForBar.flatMap(k => bmiStats[k]);
            const mAllBmi = calcMean(allBmiArr), mdAllBmi = calcMedian(allBmiArr), sdAllBmi = calcStd(allBmiArr, mAllBmi);
            meanAll.bmi = mAllBmi; medianAll.bmi = mdAllBmi; stdAll.bmi = sdAllBmi;
            avg['All'] = meanAll; medianData['All'] = medianAll; stdData['All'] = stdAll;

            // Bar chart
            const plotCats = [...prods.filter(p => p !== 'SideM'), 'Others', 'All'];
            const plotCatsBmi = [...prods, 'Others', 'All'];
            const labels = plotCats.map(p => known[p] || p);
            const labelsBmi = plotCatsBmi.map(p => known[p] || p);
            const fileMap = {
                '765AS': '765as', 'CG': 'cg', 'ML': 'ml', 'SC': 'sc',
                '学園': 'gk', 'Others': 'others', 'All': 'all', 'SideM': 'sidem'
            };

            const barFields = [
                { field: 'age', title: '年龄', min: 14, useBmiCats: false },
                { field: 'height', title: '身高(cm)', min: 155, useBmiCats: false },
                { field: 'weight', title: '体重(kg)', min: 40, useBmiCats: false },
                { field: 'bust', title: '胸围(cm)', min: 79, useBmiCats: false },
                { field: 'waist', title: '腰围(cm)', min: 53, useBmiCats: false },
                { field: 'hip', title: '臀围(cm)', min: 78, useBmiCats: false },
                { field: 'bmi', title: 'BMI', min: 16, useBmiCats: true }
            ];

            let currentModeValue = 'mean';
            let currentFieldIdx = 0;
            let barChart = null;

            function drawBarChart(field, title, min, useBmiCats) {
                const barEl = document.getElementById('barChart');
                if (!barChart) {
                    barChart = echarts.init(barEl);
                    barChart.on('click', e => {
                        window.location.href = fileMap[e.name] + '.html';
                    });
                }
                barChart.resize();
                const cats = useBmiCats ? plotCatsBmi : plotCats;
                const xLabels = useBmiCats ? labelsBmi : labels;
                const sourceData = currentModeValue === 'mean' ? avg : medianData;

                barChart.setOption({
                    title: { text: title, left: 'center', top: 0 },
                    textStyle: { fontFamily: 'font-title' },
                    tooltip: {
                        trigger: 'item',
                        formatter: params => {
                            const categoryKey = cats[params.dataIndex];
                            const sigma = stdData[categoryKey][field] || 0;
                            const modeName = currentModeValue === 'mean' ? 'μ' : 'Med';
                            return `${params.name}<br/>${params.marker}${modeName} = ${params.value.toFixed(2)}<br/>${params.marker}σ = ${sigma.toFixed(2)}`;
                        }
                    },
                    xAxis: { show: false, data: xLabels },
                    yAxis: { type: 'value', min },
                    series: [{
                        type: 'bar',
                        data: cats.map(p => ({
                            name: known[p] || p,
                            value: +(sourceData[p][field] || 0),
                            itemStyle: { color: colors[p in known ? known[p] : p] }
                        })),
                        barWidth: '50%',
                        label: {
                            show: true, position: 'top', fontWeight: 'bold',
                            formatter: params => params.value.toFixed(2)
                        }
                    }],
                }, true);
            }

            const barBtns = document.querySelectorAll('#barChartBtns button');
            function updateBar(idx) {
                currentFieldIdx = idx;
                barBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
                const { field, title, min, useBmiCats } = barFields[idx];
                drawBarChart(field, title, min, useBmiCats);
            }
            barBtns.forEach((btn, idx) => {
                btn.addEventListener('click', () => updateBar(idx));
            });

            const btnMean = document.getElementById('btn-mean');
            const btnMedian = document.getElementById('btn-med');
            btnMean.addEventListener('click', () => {
                currentModeValue = 'mean';
                btnMean.classList.add('active'); btnMedian.classList.remove('active');
                updateBar(currentFieldIdx);
            });
            btnMedian.addEventListener('click', () => {
                currentModeValue = 'median';
                btnMedian.classList.add('active'); btnMean.classList.remove('active');
                updateBar(currentFieldIdx);
            });
            updateBar(0);

            // Pie chart
            let distChart = null;

            function computeDistribution(prodKeys, distType) {
                const result = [];
                if (prodKeys.includes('All')) prodKeys = [...allKeysForPie];

                if (distType === 'home') {
                    const combinedHome = {};
                    prodKeys.forEach(key => {
                        Object.entries(hometownCounts[key] || {}).forEach(([loc, cnt]) => {
                            combinedHome[loc] = (combinedHome[loc] || 0) + cnt;
                        });
                    });
                    Object.entries(combinedHome).forEach(([loc, cnt]) => {
                        if (cnt > 0) result.push({ name: loc, value: cnt });
                    });
                    result.sort((a, b) => b.value - a.value);
                    return result;
                }
                if (distType === 'hand') {
                    const combinedHand = {};
                    prodKeys.forEach(key => {
                        Object.entries(handedCounts[key] || {}).forEach(([hand, cnt]) => {
                            combinedHand[hand] = (combinedHand[hand] || 0) + cnt;
                        });
                    });
                    Object.entries(combinedHand).forEach(([hand, cnt]) => {
                        if (cnt > 0) result.push({ name: hand, value: cnt });
                    });
                    return result;
                }
                if (distType === 'blood') {
                    const combinedBlood = {};
                    prodKeys.forEach(key => {
                        Object.entries(bloodCounts[key] || {}).forEach(([bt, cnt]) => {
                            combinedBlood[bt] = (combinedBlood[bt] || 0) + cnt;
                        });
                    });
                    Object.entries(combinedBlood).forEach(([bt, cnt]) => {
                        if (cnt > 0) result.push({ name: bt, value: cnt });
                    });
                    return result;
                }

                let allValues = [];
                const bucketDefs = {
                    age: {
                        keys: ['≤12岁', '13-15岁', '16-18岁', '19-22岁', '≥23岁'],
                        fn: v => v <= 12 ? 0 : v <= 15 ? 1 : v <= 18 ? 2 : v <= 22 ? 3 : 4,
                        src: 'ages'
                    },
                    height: {
                        keys: ['≤149cm', '150-156cm', '157-162cm', '163-169cm', '≥170cm'],
                        fn: v => v <= 149 ? 0 : v <= 156 ? 1 : v <= 162 ? 2 : v <= 169 ? 3 : 4,
                        src: 'heights'
                    },
                    weight: {
                        keys: ['≤35kg', '36-40kg', '41-45kg', '46-50kg', '51-55kg', '≥56kg'],
                        fn: v => v <= 35 ? 0 : v <= 40 ? 1 : v <= 45 ? 2 : v <= 50 ? 3 : v <= 55 ? 4 : 5,
                        src: 'weights'
                    },
                    bust: {
                        keys: ['≤72cm', '73-78cm', '79-83cm', '84-89cm', '≥90cm'],
                        fn: v => v <= 72 ? 0 : v <= 78 ? 1 : v <= 83 ? 2 : v <= 89 ? 3 : 4,
                        src: 'busts'
                    },
                    waist: {
                        keys: ['≤54cm', '55-56cm', '57-59cm', '60-62cm', '≥63cm'],
                        fn: v => v <= 54 ? 0 : v <= 56 ? 1 : v <= 59 ? 2 : v <= 62 ? 3 : 4,
                        src: 'waists'
                    },
                    hip: {
                        keys: ['≤76cm', '77-80cm', '81-84cm', '85-89cm', '≥90cm'],
                        fn: v => v <= 76 ? 0 : v <= 80 ? 1 : v <= 84 ? 2 : v <= 89 ? 3 : 4,
                        src: 'hips'
                    }
                };

                const def = bucketDefs[distType];
                if (!def) return [];

                prodKeys.forEach(key => {
                    allValues = allValues.concat(stats[key]?.[def.src] || []);
                });
                const counts = def.keys.map(() => 0);
                allValues.forEach(v => { counts[def.fn(v)]++; });
                def.keys.forEach((name, i) => {
                    if (counts[i] > 0) result.push({ name, value: counts[i] });
                });
                return result;
            }

            function ensureDistChart() {
                if (!distChart) {
                    distChart = echarts.init(document.getElementById('distChart'));
                }
                distChart.resize();
                return distChart;
            }

            function getPieOptionGeneric(title, pieData, opts) {
                const narrow = window.innerWidth <= 900;
                return {
                    title: { text: title, left: 'center', top: 0 },
                    textStyle: { fontFamily: 'font-title', fontSize: 14 },
                    tooltip: {
                        trigger: 'item',
                        formatter: params => `${params.name}<br/>${params.marker}${params.value}人<br/>${params.marker}${params.percent}%`
                    },
                    legend: narrow ? { show: false } : {
                        type: 'scroll', orient: 'vertical', left: 10, top: 20, bottom: 20,
                        data: pieData.map(d => d.name)
                    },
                    label: { show: true, position: 'inside', formatter: '{b}（{d}%）' },
                    series: [{
                        type: 'pie',
                        radius: opts?.radius || '50%',
                        center: narrow ? ['50%', '55%'] : ['50%', '50%'],
                        data: pieData,
                        selectedMode: opts?.selectedMode || 'multiple',
                        selectedOffset: opts?.selectedOffset ?? 30,
                        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
                    }]
                };
            }

            let currentProds = ['All'];
            let currentDist = 'age';

            const prodBtns = document.querySelectorAll('#prodBtns button');
            const allButton = Array.from(prodBtns).find(b => b.getAttribute('data-prod') === 'All');
            const nonAllButtons = Array.from(prodBtns).filter(b => b.getAttribute('data-prod') !== 'All');

            prodBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const key = btn.getAttribute('data-prod');
                    if (key === 'All') {
                        prodBtns.forEach(b => b.classList.remove('active'));
                        allButton.classList.add('active');
                        currentProds = ['All'];
                    } else {
                        const isActive = btn.classList.toggle('active');
                        if (allButton.classList.contains('active')) {
                            allButton.classList.remove('active');
                            currentProds = [];
                        }
                        if (isActive) currentProds.push(key);
                        else currentProds = currentProds.filter(k => k !== key);
                        if (currentProds.length === 0) {
                            prodBtns.forEach(b => b.classList.remove('active'));
                            allButton.classList.add('active');
                            currentProds = ['All'];
                        }
                        if (nonAllButtons.every(b => b.classList.contains('active'))) {
                            nonAllButtons.forEach(b => b.classList.remove('active'));
                            allButton.classList.add('active');
                            currentProds = ['All'];
                        }
                    }
                    renderDistChart();
                });
            });

            const distBtns = document.querySelectorAll('#distBtns button');
            function clearDistActive() { distBtns.forEach(b => b.classList.remove('active')); }

            function renderDistChart() {
                const chart = ensureDistChart();
                const titleMap = { age: '年龄', height: '身高(cm)', weight: '体重(kg)', bust: '胸围(cm)', waist: '腰围(cm)', hip: '臀围(cm)', blood: '血型', home: '出身地', hand: '惯用手' };
                const pieData = computeDistribution(currentProds, currentDist);
                const opts = currentDist === 'home' ? { radius: ['50%', '70%'], selectedMode: 'single', selectedOffset: 0 } : {};
                chart.setOption(getPieOptionGeneric(titleMap[currentDist], pieData, opts), true);
            }

            document.getElementById('btn-age-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-age-dist').classList.add('active');
                currentDist = 'age'; renderDistChart();
            });
            document.getElementById('btn-height-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-height-dist').classList.add('active');
                currentDist = 'height'; renderDistChart();
            });
            document.getElementById('btn-home-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-home-dist').classList.add('active');
                currentDist = 'home'; renderDistChart();
            });
            document.getElementById('btn-hand-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-hand-dist').classList.add('active');
                currentDist = 'hand'; renderDistChart();
            });
            document.getElementById('btn-weight-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-weight-dist').classList.add('active');
                currentDist = 'weight'; renderDistChart();
            });
            document.getElementById('btn-bust-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-bust-dist').classList.add('active');
                currentDist = 'bust'; renderDistChart();
            });
            document.getElementById('btn-waist-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-waist-dist').classList.add('active');
                currentDist = 'waist'; renderDistChart();
            });
            document.getElementById('btn-hip-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-hip-dist').classList.add('active');
                currentDist = 'hip'; renderDistChart();
            });
            document.getElementById('btn-blood-dist').addEventListener('click', () => {
                clearDistActive(); document.getElementById('btn-blood-dist').classList.add('active');
                currentDist = 'blood'; renderDistChart();
            });

            // Mode toggle
            const btnValueMode = document.getElementById('btn-value');
            const btnRatioMode = document.getElementById('btn-ratio');
            const valueModeDiv = document.getElementById('valueMode');
            const ratioModeDiv = document.getElementById('ratioMode');

            btnValueMode.addEventListener('click', () => {
                btnValueMode.classList.add('active'); btnRatioMode.classList.remove('active');
                valueModeDiv.style.display = 'block'; ratioModeDiv.style.display = 'none';
                requestAnimationFrame(() => {
                    if (barChart) barChart.resize();
                });
            });
            btnRatioMode.addEventListener('click', () => {
                btnRatioMode.classList.add('active'); btnValueMode.classList.remove('active');
                valueModeDiv.style.display = 'none'; ratioModeDiv.style.display = 'block';
                requestAnimationFrame(() => renderDistChart());
            });

            // Resize
            window.addEventListener('resize', function () {
                if (barChart) barChart.resize();
                if (distChart) distChart.resize();
            });
        });
})();
