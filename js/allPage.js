fetch('data/c@st.min.json').then(r => r.json()).then(data => {
    const container = document.getElementById('card-container');
    const filterContainer = document.getElementById('filter-container');
    const modal = document.getElementById('modal');
    const detail = document.getElementById('detail-content');
    const closeBtn = document.querySelector('.close');

    const now = new Date();
    const jstDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    const todayStr = String(jstDate.getMonth() + 1).padStart(2, '0') + String(jstDate.getDate()).padStart(2, '0');

    let similarityTargetRole = null;
    let selectedVoice = '';
    let selectedHometown = '';
    let selectedBirthMonth = '';
    let selectedBirthDay = '';

    // Pagination
    let currentPage = 1;
    const PAGE_SIZE = 60;
    let filteredList = [];

    // Type classification
    let selectedTypes = new Set();
    const typeConfigs = [
        {
            match: function (prods) { return prods.length > 0 && prods.every(function (p) { return p === 'THE IDOLM@STER' || p === 'MILLION LIVE!'; }); },
            types: ['Princess', 'Fairy', 'Angel'],
            colors: { Princess: '#FF2384', Fairy: '#005EFF', Angel: '#FFBB01' }
        },
        {
            match: function (prods) { return prods.length === 1 && prods[0] === 'CINDERELLA GIRLS'; },
            types: ['Cute', 'Cool', 'Passion'],
            colors: { Cute: '#ef2782', Cool: '#006aff', Passion: '#f49207' }
        },
        {
            match: function (prods) { return prods.length === 1 && prods[0] === 'SideM'; },
            types: ['Physical', 'Intelli', 'Mental'],
            colors: { Physical: '#EB313A', Intelli: '#2EBAE5', Mental: '#E7C224' }
        },
        {
            match: function (prods) { return prods.length === 1 && prods[0] === 'SHINY COLORS'; },
            types: ['Stella', 'Luna', 'Sol'],
            colors: { Stella: '#e03c6e', Luna: '#1c35f1', Sol: '#ecec14' }
        }
    ];

    function getTypeConfig() {
        if (selected.has('ALL')) return null;
        var prods = Array.from(selected);
        for (var i = 0; i < typeConfigs.length; i++) {
            if (typeConfigs[i].match(prods)) return typeConfigs[i];
        }
        return null;
    }


    const allRoles = data.flatMap(prod => prod.staff.map(mem => ({
        ...mem,
        production: ['961 Production', '876 Production'].includes(prod.production) ? 'Others' : prod.production
    })));
    const productions = Array.from(new Set(allRoles.map(r => r.production))).filter(p => p !== 'Others');
    const buttons = ['ALL', ...productions, 'Others', 'Active'];
    let selected = new Set(['ALL']);
    let activeFilter = true;
    let sortAttr = '';

    const colorMap = {
        'ALL': '#ff74b8', 'THE IDOLM@STER': '#f34f6d', 'CINDERELLA GIRLS': '#2681c8', 'MILLION LIVE!': '#ffc30b',
        'SideM': '#0fbe94', 'SHINY COLORS': '#8dbbff', 'Gakuen': '#f39800', 'Active': '#656a75', 'Others': '#656a75'
    };

    // Build filter UI inside tool panel
    const toolPanel = window._toolPanel;
    const createSection = window._toolPanelCreateSection;

    // 1. 企划筛选
    const prodSection = createSection('企划筛选');
    const prodBtnWrap = document.createElement('div');
    prodBtnWrap.className = 'all-filter-section';
    const prodButtons = buttons.filter(n => n !== 'Active');

    prodButtons.forEach(name => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.dataset.prod = name;
        btn.className = 'all-filter-btn';
        btn.style.setProperty('--btn-color', colorMap[name] || '#656a75');
        if (name === 'ALL') btn.classList.add('active');
        btn.onclick = () => {
            if (name === 'ALL') selected = new Set(['ALL']);
            else {
                selected.has(name) ? selected.delete(name) : selected.add(name);
                if (selected.has('ALL')) selected.delete('ALL');
                if (selected.size === 0 || (productions.every(p => selected.has(p)) && selected.has('Others'))) selected = new Set(['ALL']);
            }
            selectedTypes = new Set();
            updateFilters(); updateTypeSection(); updateVoiceSection(); updateCards();
        };
        prodBtnWrap.appendChild(btn);
    });
    prodSection.appendChild(prodBtnWrap);
    toolPanel.appendChild(prodSection);

    // 2. 类型筛选（动态）
    const typeSection = createSection('类型筛选');
    const typeBtnWrap = document.createElement('div');
    typeBtnWrap.className = 'all-filter-section';
    typeSection.appendChild(typeBtnWrap);
    typeSection.style.display = 'none';
    toolPanel.appendChild(typeSection);

    function updateTypeSection() {
        const cfg = getTypeConfig();
        typeBtnWrap.innerHTML = '';
        if (!cfg) {
            typeSection.style.display = 'none';
            return;
        }
        typeSection.style.display = '';
        cfg.types.forEach(type => {
            const btn = document.createElement('button');
            btn.textContent = type;
            btn.className = 'all-filter-btn all-type-btn';
            btn.style.setProperty('--btn-color', cfg.colors[type]);
            if (selectedTypes.has(type)) btn.classList.add('active');
            btn.onclick = () => {
                selectedTypes.has(type) ? selectedTypes.delete(type) : selectedTypes.add(type);
                updateTypeSection(); updateCards();
            };
            typeBtnWrap.appendChild(btn);
        });
    }

    // 2.5 附声情况筛选（仅 CINDERELLA GIRLS）
    const voiceSection = createSection('附声情况');
    const voiceBtnWrap = document.createElement('div');
    voiceBtnWrap.className = 'all-filter-section';
    voiceSection.appendChild(voiceBtnWrap);
    voiceSection.style.display = 'none';
    toolPanel.appendChild(voiceSection);

    function updateVoiceSection() {
        voiceBtnWrap.innerHTML = '';
        if (!(selected.size === 1 && selected.has('CINDERELLA GIRLS'))) {
            voiceSection.style.display = 'none';
            selectedVoice = '';
            return;
        }
        voiceSection.style.display = '';
        [{ label: '已附声', value: 'voiced', color: '#e10600' },
        { label: '未附声', value: 'unvoiced', color: '#6cc24a' }].forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = item.label;
            btn.className = 'all-filter-btn';
            btn.style.setProperty('--btn-color', item.color);
            if (selectedVoice === item.value) btn.classList.add('active');
            btn.onclick = () => {
                selectedVoice = selectedVoice === item.value ? '' : item.value;
                updateVoiceSection();
                updateCards();
            };
            voiceBtnWrap.appendChild(btn);
        });
    }

    // 2.8 出身地/生日筛选
    const birthSection = createSection('出身地/生日筛选');
    const birthRow = document.createElement('div');
    birthRow.className = 'all-filter-row';

    // 出身地 select
    const hometownSelect = document.createElement('select');
    hometownSelect.id = 'hometown-select';
    const hometowns = ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県', '日本国外'];
    hometownSelect.innerHTML = '<option value="">出身地</option>' + hometowns.map(h => `<option value="${h}">${h}</option>`).join('');
    hometownSelect.onchange = () => { selectedHometown = hometownSelect.value; updateCards(); };

    // 诞生月 select
    const birthMonthSelect = document.createElement('select');
    birthMonthSelect.id = 'birth-month-select';
    birthMonthSelect.innerHTML = '<option value="">诞生月</option>' + Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}月</option>`).join('');

    // 诞生日 select
    const birthDaySelect = document.createElement('select');
    birthDaySelect.id = 'birth-day-select';
    birthDaySelect.innerHTML = '<option value="">诞生日</option>';
    for (let d = 1; d <= 31; d++) birthDaySelect.innerHTML += `<option value="${d}">${d}日</option>`;

    function updateBirthDayOptions() {
        const m = parseInt(selectedBirthMonth);
        const days = m ? [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] : 31;
        birthDaySelect.innerHTML = '<option value="">诞生日</option>';
        for (let d = 1; d <= days; d++) birthDaySelect.innerHTML += `<option value="${d}">${d}日</option>`;
        if (selectedBirthDay && parseInt(selectedBirthDay) > days) {
            selectedBirthDay = '';
        }
        birthDaySelect.value = selectedBirthDay;
    }

    birthMonthSelect.onchange = () => {
        selectedBirthMonth = birthMonthSelect.value;
        updateBirthDayOptions();
        updateCards();
    };
    birthDaySelect.onchange = () => { selectedBirthDay = birthDaySelect.value; updateCards(); };

    birthRow.append(hometownSelect, birthMonthSelect, birthDaySelect);
    birthSection.appendChild(birthRow);
    toolPanel.appendChild(birthSection);

    // 3. 偶像筛选
    const idolSection = createSection('偶像筛选');
    const idolBtnWrap = document.createElement('div');
    idolBtnWrap.className = 'all-filter-section';
    const idolBtn = document.createElement('button');
    idolBtn.textContent = 'IDOL';
    idolBtn.dataset.prod = 'Active';
    idolBtn.className = 'all-filter-btn all-idol-btn';
    idolBtn.style.setProperty('--btn-color', colorMap['Active']);
    if (activeFilter) idolBtn.classList.add('active');
    idolBtn.onclick = () => {
        activeFilter = !activeFilter;
        idolBtn.classList.toggle('active', activeFilter);
        updateCards();
    };
    idolBtnWrap.appendChild(idolBtn);
    idolSection.appendChild(idolBtnWrap);
    toolPanel.appendChild(idolSection);

    // 4. 排序
    const sortSection = createSection('排序');
    const sortSelect = document.createElement('select');
    sortSelect.className = 'all-sort-select';
    sortSelect.name = "all-sort";
    sortSelect.innerHTML = `
    <option value="">默认</option>
    <option value="age">年龄</option>
    <option value="height">身高</option>
    <option value="weight">体重</option>
    <option value="bust">胸围</option>
    <option value="waist">腰围</option>
    <option value="hip">臀围</option>
    <option value="bmi">BMI</option>
    <option value="shoe">鞋码</option>
`;
    sortSelect.onchange = () => {
        sortAttr = sortSelect.value;
        if (sortAttr !== 'similarity') {
            const simOpt = sortSelect.querySelector('option[value="similarity"]');
            if (simOpt) simOpt.remove();
            similarityTargetRole = null;
        }
        updateCards();
    };
    sortSection.appendChild(sortSelect);
    toolPanel.appendChild(sortSection);

    // 隐藏原始筛选容器
    filterContainer.style.display = 'none';

    function updateFilters() {
        prodBtnWrap.querySelectorAll('.all-filter-btn').forEach(b => {
            const p = b.dataset.prod;
            if (p) b.classList.toggle('active', selected.has(p));
        });
    }

    function calculateSimilarity(target, current) {
        if (!target || !current) return null;
        let score = 0, percent = 0;
        const fcu = (x, min, diff) => (x - min) / diff;
        if (target.height) {
            if (!current.height) return null;
            score += 0.2 * ((fcu(target.height, 127, 48) - fcu(current.height, 127, 48)) ** 2); percent += 0.2;
        }
        if (target.weight) {
            if (!current.weight) return null;
            score += 0.15 * ((fcu(target.weight, 28, 32) - fcu(current.weight, 28, 32)) ** 2); percent += 0.15;
        }
        if (Array.isArray(target.three_sizes)) {
            if (!Array.isArray(current.three_sizes)) return null;
            if (target.three_sizes[0]) {
                if (!current.three_sizes[0]) return null;
                score += 0.3 * ((fcu(target.three_sizes[0], 60, 35) - fcu(current.three_sizes[0], 60, 35)) ** 2); percent += 0.3;
            }
            if (target.three_sizes[1]) {
                if (!current.three_sizes[1]) return null;
                score += 0.15 * ((fcu(target.three_sizes[1], 47, 18) - fcu(current.three_sizes[1], 47, 18)) ** 2); percent += 0.15;
            }
            if (target.three_sizes[2]) {
                if (!current.three_sizes[2]) return null;
                score += 0.2 * ((fcu(target.three_sizes[2], 65, 27) - fcu(current.three_sizes[2], 65, 27)) ** 2); percent += 0.2;
            }
        }
        if (percent === 0) return null;
        score /= percent;
        return Math.max(0, (1 - Math.sqrt(score)) * 100);
    }

    function getVal(r) {
        switch (sortAttr) {
            case 'age': return r.age;
            case 'height': return r.height;
            case 'weight': return r.weight;
            case 'bust': return Array.isArray(r.three_sizes) ? r.three_sizes[0] : null;
            case 'waist': return Array.isArray(r.three_sizes) ? r.three_sizes[1] : null;
            case 'hip': return Array.isArray(r.three_sizes) ? r.three_sizes[2] : null;
            case 'shoe': return r.shoe_size;
            case 'bmi': return (r.height && r.weight) ? r.weight / ((r.height / 100) ** 2) : null;
            case 'similarity': return calculateSimilarity(similarityTargetRole, r);
            default: return null;
        }
    }

    function updateCards() {
        let list = allRoles.filter(r => {
            const pm = selected.has('ALL') || selected.has(r.production);
            const am = !activeFilter || !r['non-playable'];
            const tm = selectedTypes.size === 0 || selectedTypes.has(r.type);
            const vm = !selectedVoice || (selectedVoice === 'voiced' ? r.cv != null : r.cv == null);
            const hm = !selectedHometown || r.hometown === selectedHometown;
            let bm = true;
            if (selectedBirthMonth || selectedBirthDay) {
                if (!r.birthday) { bm = false; }
                else {
                    if (selectedBirthMonth) {
                        const monthStr = String(selectedBirthMonth).padStart(2, '0');
                        bm = r.birthday.slice(0, 2) === monthStr;
                    }
                    if (bm && selectedBirthDay) {
                        const dayStr = String(selectedBirthDay).padStart(2, '0');
                        bm = r.birthday.slice(2, 4) === dayStr;
                    }
                }
            }
            if (!pm || !am || !tm || !vm || !hm || !bm) return false;
            if (sortAttr) { const v = getVal(r); return v != null; }
            return true;
        });
        if (sortAttr) {
            list.sort((a, b) => {
                const va = getVal(a), vb = getVal(b);
                if (sortAttr === 'similarity') return vb - va;
                if (va === vb) {
                    if (a.age === b.age) {
                        const ba = parseInt(a.birthday, 10) || 0;
                        const bb = parseInt(b.birthday, 10) || 0;
                        return sortAttr === "age" ? bb - ba : ba - bb;
                    }
                    return b.age - a.age;
                }
                return va - vb;
            });
        } else {
            list.sort((a, b) => {
                const isBirthdayA = (a.birthday === todayStr);
                const isBirthdayB = (b.birthday === todayStr);
                return (isBirthdayB ? 1 : 0) - (isBirthdayA ? 1 : 0);
            });
        }
        filteredList = list;
        changePage(1);
    }

    function changePage(page) {
        const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        currentPage = page;

        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageData = filteredList.slice(start, end);

        renderCards(pageData, start);
        renderPagination(totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderCards(list, startIndex) {
        container.innerHTML = '';
        list.forEach((role, index) => {
            const card = document.createElement('div'); card.className = 'card';
            const main = ['THE IDOLM@STER', 'CINDERELLA GIRLS', 'MILLION LIVE!', 'SideM', 'SHINY COLORS', 'Gakuen'];
            let clr = role.image_color ? role.image_color : '#ff74b8';
            let clrNext = main.includes(role.production) ? colorMap[role.production] : colorMap['Others'];
            card.style.setProperty('--card-glow', clr);
            card.style.setProperty('--card-glow-next', clrNext);
            card.style.animationDelay = `${Math.min(index * 0.03, 0.6)}s`;

            const imgwrap = document.createElement('div');
            imgwrap.className = 'imgwrap';
            if (role.img) {
                const img = document.createElement('img');
                img.src = role.img;
                img.alt = role.name;
                img.loading = 'lazy';
                imgwrap.appendChild(img);
            }
            card.appendChild(imgwrap);
            const nm = document.createElement('div');
            nm.className = 'name';
            nm.style.setProperty('--card-name', role.image_color ? role.image_color : '#656a75');

            let lbl = role.name;
            if (role.birthday === todayStr && !sortAttr) {
                lbl = '🎉 ' + lbl + ' 🎂';
            }
            if (sortAttr) {
                const v = getVal(role);
                if (sortAttr === 'similarity') {
                    lbl += ` (${v.toFixed(2)}%)`;
                } else {
                    lbl += sortAttr === 'age' ? ` (${v})` : (['height', 'weight', 'bust', 'waist', 'hip', 'shoe'].includes(sortAttr) ? ` (${v.toFixed(1)})` : ` (${v.toFixed(2)})`);
                }
            }
            nm.textContent = lbl; card.appendChild(nm);
            card.onclick = () => showDetail(role);
            container.appendChild(card);
        });
    }

    // Pagination renderer (matching demo.html style)
    function renderPagination(totalPages) {
        let pgEl = document.getElementById('pagination');
        if (!pgEl) {
            pgEl = document.createElement('div');
            pgEl.id = 'pagination';
            pgEl.className = 'pagination-wrapper';
            container.parentNode.insertBefore(pgEl, container.nextSibling);
        }
        pgEl.innerHTML = '';
        if (totalPages <= 1) return;

        const createBtn = (text, onClick, isActive, isDisabled, isDots) => {
            const btn = document.createElement('button');
            btn.className = `pg-btn ${isActive ? 'active' : ''} ${isDots ? 'pg-dots' : ''}`;

            if (isDots) {
                const span = document.createElement('span');
                span.textContent = '...';
                btn.appendChild(span);

                const input = document.createElement('input');
                input.type = 'text';
                input.inputMode = 'numeric';
                input.className = 'pg-input';
                input.name = 'pg-input';
                input.addEventListener('input', () => {
                    input.value = input.value.replace(/[^\d]/g, '');
                    const nv = parseInt(input.value);
                    if (nv > totalPages) input.value = totalPages;
                    if (nv === 0) input.value = 1;
                });
                const jump = () => {
                    let val = parseInt(input.value);
                    if (!isNaN(val) && currentPage !== val) changePage(val);
                    else { btn.classList.remove('input-mode'); input.value = ''; }
                };
                input.addEventListener('keydown', (e) => { if (e.key === 'Enter') jump(); });
                input.addEventListener('blur', jump);
                btn.appendChild(input);
                btn.onclick = () => { btn.classList.add('input-mode'); input.focus(); };
            } else {
                btn.textContent = text;
                if (isDisabled) btn.disabled = true;
                if (onClick) btn.onclick = onClick;
            }
            return btn;
        };

        const btnChangePage = (p) => { if (currentPage !== p) changePage(p); };
        const range = 2;

        // Prev
        pgEl.appendChild(createBtn('<', () => changePage(currentPage - 1), false, currentPage === 1));
        // First page
        pgEl.appendChild(createBtn('1', () => btnChangePage(1), currentPage === 1));
        // Left dots
        if (currentPage - range > 2) pgEl.appendChild(createBtn('...', null, false, false, true));
        // Middle pages
        for (let i = Math.max(2, currentPage - range); i <= Math.min(totalPages - 1, currentPage + range); i++) {
            pgEl.appendChild(createBtn(i, () => btnChangePage(i), currentPage === i));
        }
        // Right dots
        if (currentPage + range < totalPages - 1) pgEl.appendChild(createBtn('...', null, false, false, true));
        // Last page
        if (totalPages > 1) pgEl.appendChild(createBtn(totalPages, () => btnChangePage(totalPages), currentPage === totalPages));
        // Next
        pgEl.appendChild(createBtn('>', () => changePage(currentPage + 1), false, currentPage === totalPages));
    }

    function showDetail(role) {
        const dlg = document.querySelector('#modal .dialog');
        const frameColor = role.image_color ? role.image_color : colorMap['Others'];
        dlg.style.setProperty('--dialog-color', frameColor)
        detail.innerHTML = ''; const textDiv = document.createElement('div'); textDiv.className = 'text';
        const h2 = document.createElement('h2'); h2.textContent = role.name; h2.style.setProperty('--h2shadow', frameColor); textDiv.appendChild(h2);
        const detailFields = [['声优', 'cv'], ['生日', 'birthday'], ['血型', 'blood_type'], ['出身', 'hometown'], ['惯用手', 'handedness'], ['所属组合', 'group'], ['首次登场', 'debut_date'], ['兴趣', 'hobbies'], ['特长', 'skills'], ['爱好', 'likes'], ['介绍', 'bio'], ['原职', 'ex-job'], ['传闻', 'info'], ['补充', 'addition'], ['理由', 'reason'], ['座右铭', 'motto'], ['关于组合', 'about_unit']];
        detailFields.forEach(([label, key]) => { let val = role[key]; if (val == null) return; if (key === 'birthday' && typeof val === 'string' && val.length === 4) { const m = parseInt(val.slice(0, 2)); const d = parseInt(val.slice(2)); val = `${m}月${d}日`; } if (val == null) return; const div = document.createElement('div'); div.className = 'info'; div.innerHTML = `<strong>${label}:</strong><span>${val}</span>`; textDiv.appendChild(div); });
        if (role.quotes) { const qDiv = document.createElement('div'); qDiv.className = 'info info-quote'; qDiv.style.setProperty('--quote-shadow', frameColor); qDiv.textContent = role.quotes; textDiv.appendChild(qDiv); }
        if (role.img) { const imgEl = document.createElement('img'); imgEl.src = role.img; const avatarFrame = document.createElement('div'); avatarFrame.className = 'avatar-frame'; avatarFrame.style.setProperty('--avatar-color', frameColor); avatarFrame.appendChild(imgEl); detail.append(textDiv, avatarFrame); } else detail.append(textDiv);
        modal.classList.add('open');
        detail.scrollTop = 0;

        if (!role.age && !role.height && !role.weight && !role.three_sizes) { return; }
        const radarContainer = document.createElement('div'); radarContainer.id = 'radarChart'; radarContainer.style.width = '100%'; textDiv.appendChild(radarContainer);

        const radarChart = echarts.init(radarContainer);
        const dims = [
            { name: '年龄', value: role.age },
            { name: '身高', value: role.height },
            { name: '体重', value: role.weight },
            { name: '胸围', value: Array.isArray(role.three_sizes) ? role.three_sizes[0] : null },
            { name: '腰围', value: Array.isArray(role.three_sizes) ? role.three_sizes[1] : null },
            { name: '臀围', value: Array.isArray(role.three_sizes) ? role.three_sizes[2] : null },
            { name: '鞋码', value: role.shoe_size },
        ].filter(d => d.value != null);
        const main = ['THE IDOLM@STER', 'CINDERELLA GIRLS', 'MILLION LIVE!', 'SideM', 'SHINY COLORS', 'Gakuen'];
        const clr = main.includes(role.production) ? colorMap[role.production] : colorMap['Others'];
        const minVals = { '年龄': 9, '身高': 127, '体重': 28, '胸围': 60, '腰围': 47, '臀围': 65, '鞋码': 20 };
        const maxVals = { '年龄': 28, '身高': 175, '体重': 60, '胸围': 95, '腰围': 65, '臀围': 92, '鞋码': 28 };
        const imgColor = role.image_color ? role.image_color : colorMap['Others'];
        const option = {
            textStyle: { fontFamily: 'font-title', fontSize: 14 },
            tooltip: {
                formatter: function (params) {
                    const seriesName = role.name;
                    const dataValue = params.value;
                    var dotHtml = `<span style="display:inline-block;margin:0 10px 2px 3px;border-radius:4px;width:4px;height:4px;background-color:${imgColor}"></span>`
                    let tooltipContent = `<div>${seriesName}</div>`;
                    dims.forEach((dim, index) => {
                        let unit = '';
                        if (dim.name === '体重') unit = '(kg)';
                        if (dim.name === '身高' || dim.name === '胸围' || dim.name === '腰围' || dim.name === '臀围' || dim.name === '鞋码') unit = '(cm)';
                        tooltipContent += `
            <div style="display: table-row;">
                <div style="display: table-cell; text-align: left; padding-right: 20px;padding-top: 4px;">
                ${dotHtml}${dim.name}${unit}
                </div>
                <div style="display: table-cell; text-align: right; font-weight: bold;padding-top: 4px;">
                    ${dataValue[index]}
                </div>
            </div>
        `;
                    });
                    tooltipContent += '</div>';
                    return tooltipContent;
                }
            },
            radar: {
                shape: 'polygon', splitNumber: 5, center: ['50%', '50%'], radius: window.innerWidth <= 808 ? '55%' : '65%',
                indicator: dims.map(d => ({ name: `${d.name}(${d.value}${d.name === '年龄' ? '' : d.name === '体重' ? 'kg' : 'cm'})`, min: minVals[d.name], max: maxVals[d.name] })),
                axisName: { color: '#333' },
                axisLine: { lineStyle: { color: `${clr}80`, width: 1, type: 'solid' } },
                splitLine: { lineStyle: { color: `${clr}80`, width: 1 } },
                splitArea: { show: true, areaStyle: { color: ['#0000', `${clr}20`] } }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: dims.map(d => d.value),
                    name: role.name,
                    areaStyle: { color: imgColor, opacity: 0.3 },
                    itemStyle: { color: imgColor },
                    lineStyle: { color: imgColor }
                }]
            }]
        };
        radarChart.setOption(option);
        radarChart.on('click', function () {
            similarityTargetRole = role;
            let simOpt = sortSelect.querySelector('option[value="similarity"]');
            if (!simOpt) {
                simOpt = document.createElement('option');
                simOpt.value = 'similarity';
                simOpt.textContent = '身材相似度';
                sortSelect.appendChild(simOpt);
            }
            sortSelect.value = 'similarity';
            sortAttr = 'similarity';
            modal.classList.remove('open');
            updateCards();
        });
        currentRadarChart = radarChart;
        requestAnimationFrame(() => radarChart.resize());
    }

    updateFilters(); updateVoiceSection(); updateCards();
    closeBtn.onclick = () => modal.classList.remove('open');
    modal.onclick = e => { if (e.target === modal || e.target.classList.contains('modal-wrap')) modal.classList.remove('open'); };


    // Birthday reminders
    const birthdayRoles = allRoles.filter(r => r.birthday === todayStr);
    if (birthdayRoles.length > 0) popBirthdayReminders(birthdayRoles);

    // Mouse tracking glow (only for devices with hover capability)
    if (window.matchMedia('(hover: hover)').matches) {
        let lastMouseX = -10000;
        let lastMouseY = -10000;
        const updateAllCardsGlow = () => {
            const cards = document.querySelectorAll('#card-container .card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = lastMouseX - rect.left;
                const y = lastMouseY - rect.top;
                card.style.setProperty('--x', x + 'px');
                card.style.setProperty('--y', y + 'px');
            });
        };
        window.addEventListener('mousemove', (e) => {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            requestAnimationFrame(updateAllCardsGlow);
        });
        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateAllCardsGlow);
        }, { passive: true, capture: true });
    }
});

// Typing animation
const textFrontEl = document.getElementById('typing-front')
const textInternalMarkEl = document.getElementById('typing-intermark')
const textInternalEl = document.getElementById('typing-internal')
const textRearEl = document.getElementById('typing-rear')
const textMarkEl = document.getElementById('typing-mark')

const exEl = Array
    .from({ length: 6 }, (_, i) => document.getElementById(`ex-mark${i + 1}`))
    .filter(Boolean);

const text = 'これからも、アイドル';

let time = 3000;

for (let i = 1; i <= 16; ++i) {
    let interval = 375 - Math.random() * 200;

    if (i < 6) {
        setTimeout(function () {
            textFrontEl.innerHTML = text.slice(0, i);
        }, time);
    }
    else if (i === 6) {
        setTimeout(function () {
            textInternalMarkEl.innerHTML = text.slice(5, i);
        }, time);
    }
    else if (i < 10) {
        setTimeout(function () {
            textInternalEl.innerHTML = text.slice(6, i);
        }, time);
    }
    else if (i === 10) {
        setTimeout(function () {
            textRearEl.innerHTML = text.slice(9, i);
            textMarkEl.style.marginLeft = '14px';
        }, time);
    }
    else if (i < 16) {
        setTimeout(function () {
            exEl[i - 11].innerHTML = '！';
        }, time);
    }
    else {
        setTimeout(function () {
            exEl[i - 11].innerHTML = '！';
            textMarkEl.style.animation = 'typing-blink .7s 6';
            textMarkEl.style.borderColor = 'transparent';
        }, time);
    }
    time += interval;
}
