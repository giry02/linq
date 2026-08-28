(() => {
  const items = window.MIQ_WORKSHOP_REQUIREMENTS || [];
  const summary = document.querySelector('#decision-summary');
  if (!summary || !items.length) return;

  const severityByProblem = {
    'P-002':'치명','P-003':'높음','P-005':'높음','P-006':'높음','P-007':'높음','P-008':'중간',
    'P-010':'중간','P-011':'높음','P-012':'높음','P-013':'중간','P-015':'높음','P-016':'높음',
    'P-017':'높음','P-018':'높음','P-019':'높음','P-021':'중간','P-023':'중간','P-024':'높음','P-025':'높음'
  };
  const severityRank = { '없음':0, '낮음':1, '중간':2, '높음':3, '치명':4 };
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const memoText = (value = '') => String(value)
    .replace(/할 수 있습니다\./g, '가능.')
    .replace(/해야 합니다\./g, '해야 함.')
    .replace(/이어야 합니다\./g, '이어야 함.')
    .replace(/보여줍니다\./g, '표시.')
    .replace(/바꿉니다\./g, '변경.')
    .replace(/남깁니다\./g, '보존.')
    .replace(/남습니다\./g, '남음.')
    .replace(/내려받습니다\./g, '다운로드.')
    .replace(/붙입니다\./g, '배치.')
    .replace(/막힙니다\./g, '접근 차단 위험.')
    .replace(/깨집니다\./g, '깨짐.')
    .replace(/나옵니다\./g, '발생.')
    .replace(/바뀝니다\./g, '전환됨.')
    .replace(/달라집니다\./g, '달라짐.')
    .replace(/사라집니다\./g, '사라짐.')
    .replace(/만듭니다\./g, '발생.')
    .replace(/어렵습니다\./g, '어려움.')
    .replace(/않았습니다\./g, '하지 않았음.')
    .replace(/있습니다\./g, '있음.')
    .replace(/없습니다\./g, '없음.')
    .replace(/않습니다\./g, '않음.')
    .replace(/됩니다\./g, '됨.')
    .replace(/다릅니다\./g, '다름.')
    .replace(/([가-힣]+)합니다\./g, '$1.')
    .replace(/합니다\./g, '처리.')
    .replace(/입니다\./g, '임.')
    .replace(/([가-힣])할까요\?/g, '$1 여부 확인')
    .replace(/([가-힣])까요\?/g, '$1는지 확인');
  const problemTokens = (value = '') => String(value).match(/P-\d{3}/g) || [];
  const severityOf = (value) => problemTokens(value).reduce((current, id) => {
    const next = severityByProblem[id] || '중간';
    return severityRank[next] > severityRank[current] ? next : current;
  }, '없음');
  const serviceClass = (service) => {
    if (service.includes('플릿') && service.includes('딜러')) return 'is-common';
    if (service.includes('딜러') || service.includes('본사')) return 'is-dealer';
    return 'is-fleet';
  };

  const fragment = document.createDocumentFragment();
  items.forEach((item, index) => {
    const slide = document.createElement('section');
    const severity = severityOf(item.problems);
    const issueIds = item.problems || '연결 문제점 없음';
    slide.className = `slide requirement-slide ${serviceClass(item.service)}`;
    slide.dataset.title = `${item.id} · ${item.title}`;
    slide.id = item.id;
    slide.innerHTML = `
      <header class="requirement-header">
        <div class="requirement-kicker">
          <span class="requirement-index">${String(index + 1).padStart(2, '0')} / ${items.length}</span>
          <span class="requirement-id">${escapeHtml(item.id)}</span>
          <span class="service-badge">${escapeHtml(item.service)}</span>
        </div>
        <h2>${escapeHtml(item.title)}</h2>
        <div class="requirement-meta">
          <span><b>화면</b>${escapeHtml(item.screen)}</span>
          <span><b>출처</b>260624_Service workshop #1_MVP.pptx · ${escapeHtml(item.page)}</span>
        </div>
      </header>

      <div class="original-request">
        <span>고객 원문</span>
        <p>${escapeHtml(item.request)}</p>
      </div>

      <div class="requirement-discussion">
        <article class="discussion-card understanding-card">
          <span>현재 이해</span>
          <p>${escapeHtml(memoText(item.understanding))}</p>
        </article>
        <article class="discussion-card implementation-card">
          <span>구현 방법</span>
          <p>${escapeHtml(memoText(item.implementation))}</p>
        </article>
        <article class="discussion-card issue-card">
          <div class="card-title-line">
            <span>문제·제약</span>
            <em class="severity severity-${severity}">${severity}</em>
          </div>
          <p>${escapeHtml(memoText(item.issue))}</p>
          <small><b>문제점 ID</b>${escapeHtml(issueIds)}</small>
        </article>
        <article class="discussion-card regional-card">
          <span>국내·글로벌 확인</span>
          <p>${escapeHtml(memoText(item.regional))}</p>
        </article>
      </div>

      ${item.confirm ? `<div class="confirmation-question"><span>확인 필요</span><p>${escapeHtml(item.confirm)}</p></div>` : ''}

      <div class="decision-fields" aria-label="워크숍 합의 기록">
        <span><b>결정</b> □ 수용　□ 수정　□ 보류</span>
        <span><b>담당</b> __________________</span>
        <span><b>확인기한</b> __________</span>
      </div>`;
    fragment.append(slide);
  });
  summary.before(fragment);
})();
