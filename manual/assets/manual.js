(function () {
  const root = document.documentElement;
  const service = root.dataset.service || 'fleet';
  const lang = root.lang === 'en' || root.dataset.lang === 'en' ? 'en' : 'ko';
  const data = window.LINQ_MANUAL;
  const screens = data.screens[service];
  const groups = data.menuGroups[service];
  const glossary = data.glossary;
  const txt = value => typeof value === 'string' ? value : (value?.[lang] || value?.ko || '');
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));

  const ui = {
    ko: {
      manual: '사용 매뉴얼', search: '화면·기능 검색', fleet: '플릿', dealer: '딜러', korean: '한글', english: 'English',
      menuStructure: '메뉴 구조', menuStructureDesc: '메뉴가 담당하는 기능과 포함 화면을 먼저 확인할 수 있습니다.',
      screenCount: '화면', terminology: '관련 용어', terminologyHelp: '용어를 누르면 설명이 모달로 열립니다.',
      numbered: '화면 번호별 설명', openScreen: '실제 화면 열기', zoom: '화면 전체 보기',
      index: '용어 색인', indexDesc: '용어를 검색하거나 선택해 한곳에서 뜻을 확인합니다.', termSearch: '용어 검색',
      noResult: '검색 결과가 없습니다.', close: '닫기', serviceIntroFleet: '플릿은 로그인한 업체와 그 하위 그룹·차량을 기준으로 운영 정보를 확인합니다.',
      serviceIntroDealer: '딜러는 여러 관리 업체를 선택하며 업체별 차량·운행·서비스 현황을 확인합니다.',
      useOrder: '메뉴 구조 확인 → 화면 선택 → 번호 설명 확인 → 필요한 용어 선택', clickTerm: '용어 선택', clickImage: '클릭하면 전체 길이 이미지가 열립니다.'
    },
    en: {
      manual: 'User Manual', search: 'Search screens and features', fleet: 'Fleet', dealer: 'Dealer', korean: '한국어', english: 'English',
      menuStructure: 'Menu Structure', menuStructureDesc: 'Review what each menu does and which screens it contains.',
      screenCount: 'screens', terminology: 'Related Terms', terminologyHelp: 'Select a term to open its definition in a modal.',
      numbered: 'Numbered Screen Guide', openScreen: 'Open live screen', zoom: 'View full screen',
      index: 'Term Index', indexDesc: 'Search or select a term to view its definition in one place.', termSearch: 'Search terms',
      noResult: 'No matching results.', close: 'Close', serviceIntroFleet: 'Fleet shows operation information for the signed-in company and its groups and vehicles.',
      serviceIntroDealer: 'Dealer lets you select among managed companies and review vehicle, operation, and service status for each company.',
      useOrder: 'Review menu structure → Select a screen → Read numbered items → Open terms as needed', clickTerm: 'Select term', clickImage: 'Select to open the full-length image.'
    }
  }[lang];

  const pagePath = (nextService, nextLang) => `${nextService}-${nextLang}.html`;
  const groupById = id => groups.find(group => group.id === id);
  const screenKeywords = screen => [txt(screen.title), txt(screen.purpose), txt(groupById(screen.group)?.name), ...screen.callouts.flatMap(c => [txt(c[2]), txt(c[3])]), ...screen.terms.map(id => `${txt(glossary[id]?.name)} ${txt(glossary[id]?.definition)}`)].join(' ');

  function renderSidebar() {
    return `
      <aside class="manual-sidebar">
        <div class="side-brand"><strong>Bobcat MACHINE IQ</strong><span>LIN-Q ${esc(txt(data.serviceName[service]).toUpperCase())} ${esc(ui.manual.toUpperCase())}</span></div>
        <div class="side-tools">
          <input class="manual-search" type="search" data-manual-search placeholder="${esc(ui.search)}" aria-label="${esc(ui.search)}">
          <div class="side-switches">
            <a href="${pagePath('fleet', lang)}" class="${service === 'fleet' ? 'is-current' : ''}">${esc(ui.fleet)}</a>
            <a href="${pagePath('dealer', lang)}" class="${service === 'dealer' ? 'is-current' : ''}">${esc(ui.dealer)}</a>
            <a href="${pagePath(service, 'ko')}" class="${lang === 'ko' ? 'is-current' : ''}">${esc(ui.korean)}</a>
            <a href="${pagePath(service, 'en')}" class="${lang === 'en' ? 'is-current' : ''}">${esc(ui.english)}</a>
          </div>
        </div>
        <nav class="manual-nav" aria-label="${esc(ui.menuStructure)}">
          ${groups.map(group => {
            const groupScreens = screens.filter(screen => screen.group === group.id);
            return `<div class="nav-group">
              <a class="nav-group-title" href="#menu-${esc(group.id)}"><span>${esc(txt(group.name))}</span><small>${groupScreens.length}</small></a>
              <div class="nav-links">${groupScreens.map(screen => `<a class="nav-link" href="#${esc(screen.id)}" data-nav-screen="${esc(screen.id)}">${esc(txt(screen.title))}</a>`).join('')}</div>
            </div>`;
          }).join('')}
          <a class="nav-link nav-index-link" href="#term-index">${esc(ui.index)}</a>
        </nav>
      </aside>`;
  }

  function renderCover() {
    const intro = service === 'fleet' ? ui.serviceIntroFleet : ui.serviceIntroDealer;
    return `<section class="page-card cover" id="top">
      <div class="cover-top"></div>
      <div class="cover-body">
        <p class="eyebrow">LIN-Q · ${esc(txt(data.serviceName[service]))}</p>
        <h1>${esc(txt(data.serviceName[service]))} ${esc(ui.manual)}</h1>
        <p class="cover-desc">${esc(intro)}</p>
        <div class="cover-meta">
          <span class="meta-chip">${screens.length} ${esc(ui.screenCount)}</span>
          <span class="meta-chip">${groups.length} ${esc(ui.menuStructure)}</span>
          <span class="meta-chip">${esc(ui.useOrder)}</span>
        </div>
      </div>
      <div class="menu-map">
        <div class="section-heading"><div><h2>${esc(ui.menuStructure)}</h2><p>${esc(ui.menuStructureDesc)}</p></div></div>
        <div class="menu-map-grid">
          ${groups.map(group => {
            const groupScreens = screens.filter(screen => screen.group === group.id);
            return `<article class="menu-map-card" id="menu-${esc(group.id)}">
              <h3>${esc(txt(group.name))}</h3><p>${esc(txt(group.description))}</p>
              <ul>${groupScreens.map(screen => `<li><a href="#${esc(screen.id)}">${esc(txt(screen.title))}</a></li>`).join('')}</ul>
            </article>`;
          }).join('')}
        </div>
      </div>
    </section>`;
  }

  function renderTerms(termIds) {
    return `<aside class="term-rail"><h3>${esc(ui.terminology)}</h3><p>${esc(ui.terminologyHelp)}</p><div class="term-buttons">
      ${termIds.map(id => `<button type="button" class="term-button" data-term="${esc(id)}">${esc(txt(glossary[id].name))}</button>`).join('')}
    </div></aside>`;
  }

  function renderScreen(screen) {
    const group = groupById(screen.group);
    return `<section class="page-card screen-section" id="${esc(screen.id)}" data-screen data-keywords="${esc(screenKeywords(screen))}">
      <header class="screen-head">
        <div><p class="screen-breadcrumb">${esc(txt(data.serviceName[service]))} &gt; ${esc(txt(group.name))} &gt; ${esc(txt(screen.title))}</p><h2>${esc(txt(screen.title))}</h2><p class="screen-purpose">${esc(txt(screen.purpose))}</p></div>
        <a class="open-live" href="${esc(screen.liveUrl.replace('/ko/', `/${lang}/`))}" target="_blank" rel="noreferrer">${esc(ui.openScreen)} ↗</a>
      </header>
      <div class="screen-layout">
        <div>
          <div class="annotated-shot">
            <button class="shot-button" type="button" data-image="screenshots/${esc(screen.screenshot)}" data-image-title="${esc(txt(screen.title))}" data-hint="${esc(ui.clickImage)}">
              <img src="screenshots/${esc(screen.screenshot)}" alt="${esc(txt(screen.title))}" loading="lazy">
            </button>
            ${screen.callouts.map((callout, index) => `<span class="callout-pin" style="--x:${callout[0]}%;--y:${callout[1]}%">${index + 1}</span>`).join('')}
          </div>
          <h3 class="numbered-title">${esc(ui.numbered)}</h3>
          <div class="numbered-grid">
            ${screen.callouts.map((callout, index) => `<article class="numbered-item"><div class="numbered-item-head"><span class="number-badge">${index + 1}</span><h3>${esc(txt(callout[2]))}</h3></div><p>${esc(txt(callout[3]))}</p></article>`).join('')}
          </div>
        </div>
        ${renderTerms(screen.terms)}
      </div>
    </section>`;
  }

  function renderGlossary() {
    const entries = Object.entries(glossary).sort((a, b) => txt(a[1].name).localeCompare(txt(b[1].name), lang === 'ko' ? 'ko' : 'en'));
    return `<section class="page-card glossary-section" id="term-index">
      <div class="section-heading"><div><h2>${esc(ui.index)}</h2><p>${esc(ui.indexDesc)}</p></div></div>
      <div class="glossary-tools"><input class="term-search" type="search" data-term-search placeholder="${esc(ui.termSearch)}" aria-label="${esc(ui.termSearch)}"></div>
      <div class="glossary-grid" data-glossary-grid>${entries.map(([id, term]) => `<button type="button" class="glossary-card" data-term="${esc(id)}" data-term-card data-keywords="${esc(`${txt(term.name)} ${txt(term.definition)}`)}"><strong>${esc(txt(term.name))}</strong><span>${esc(txt(term.definition).slice(0, 78))}${txt(term.definition).length > 78 ? '…' : ''}</span></button>`).join('')}</div>
      <div class="empty-state" data-term-empty>${esc(ui.noResult)}</div>
    </section>`;
  }

  function renderDialogs() {
    return `<dialog class="term-dialog" data-term-dialog><div class="dialog-head"><h2 data-term-title></h2><button class="dialog-close" type="button" data-dialog-close aria-label="${esc(ui.close)}">×</button></div><div class="dialog-body"><p data-term-definition></p></div></dialog>
      <dialog class="image-dialog" data-image-dialog><div class="dialog-head"><h2 data-image-dialog-title></h2><button class="dialog-close" type="button" data-image-close aria-label="${esc(ui.close)}">×</button></div><div class="image-dialog-body"><img data-image-dialog-img alt=""></div></dialog>`;
  }

  document.title = `LIN-Q ${txt(data.serviceName[service])} ${ui.manual}`;
  document.body.innerHTML = `<div class="manual-shell">${renderSidebar()}<main class="manual-main"><div class="content-width">${renderCover()}<div data-screen-list>${screens.map(renderScreen).join('')}</div><div class="empty-state" data-screen-empty>${esc(ui.noResult)}</div>${renderGlossary()}</div></main>${renderDialogs()}</div>`;

  const screenSearch = document.querySelector('[data-manual-search]');
  const screenSections = [...document.querySelectorAll('[data-screen]')];
  const screenEmpty = document.querySelector('[data-screen-empty]');
  screenSearch.addEventListener('input', () => {
    const query = screenSearch.value.trim().toLowerCase();
    let visible = 0;
    screenSections.forEach(section => {
      const matched = !query || section.dataset.keywords.toLowerCase().includes(query);
      section.classList.toggle('is-hidden', !matched);
      const nav = document.querySelector(`[data-nav-screen="${section.id}"]`);
      if (nav) nav.classList.toggle('is-hidden', !matched);
      if (matched) visible += 1;
    });
    screenEmpty.style.display = visible ? 'none' : 'block';
  });

  const termDialog = document.querySelector('[data-term-dialog]');
  document.addEventListener('click', event => {
    const termButton = event.target.closest('[data-term]');
    if (termButton) {
      const term = glossary[termButton.dataset.term];
      document.querySelector('[data-term-title]').textContent = txt(term.name);
      document.querySelector('[data-term-definition]').textContent = txt(term.definition);
      termDialog.showModal();
      return;
    }
    if (event.target.matches('[data-dialog-close]')) termDialog.close();
  });
  termDialog.addEventListener('click', event => { if (event.target === termDialog) termDialog.close(); });

  const termSearch = document.querySelector('[data-term-search]');
  const termCards = [...document.querySelectorAll('[data-term-card]')];
  const termEmpty = document.querySelector('[data-term-empty]');
  termSearch.addEventListener('input', () => {
    const query = termSearch.value.trim().toLowerCase();
    let visible = 0;
    termCards.forEach(card => {
      const matched = !query || card.dataset.keywords.toLowerCase().includes(query);
      card.classList.toggle('is-hidden', !matched);
      if (matched) visible += 1;
    });
    termEmpty.style.display = visible ? 'none' : 'block';
  });

  const imageDialog = document.querySelector('[data-image-dialog]');
  document.addEventListener('click', event => {
    const shot = event.target.closest('[data-image]');
    if (!shot) return;
    document.querySelector('[data-image-dialog-title]').textContent = shot.dataset.imageTitle;
    const image = document.querySelector('[data-image-dialog-img]');
    image.src = shot.dataset.image;
    image.alt = shot.dataset.imageTitle;
    imageDialog.showModal();
  });
  document.querySelector('[data-image-close]').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => { if (event.target === imageDialog) imageDialog.close(); });

  const observer = new IntersectionObserver(entries => {
    const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    document.querySelectorAll('[data-nav-screen]').forEach(link => link.classList.toggle('is-active', link.dataset.navScreen === active.target.id));
  }, { rootMargin: '-10% 0px -70% 0px', threshold: [0, .2, .5] });
  screenSections.forEach(section => observer.observe(section));
})();
