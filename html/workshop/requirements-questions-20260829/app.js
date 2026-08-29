const $ = (selector) => document.querySelector(selector);
const search = $("#search");
const serviceFilter = $("#service-filter");
const questionFilter = $("#question-filter");
const content = $("#content");
const results = $("#results");
let requirements = [];

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function row(label, value) {
  return `<div class="field"><b>${escapeHtml(label)}</b><p>${escapeHtml(value || "-")}</p></div>`;
}

function card(item) {
  const question = item["질의사항"]
    ? `<div class="question"><div class="question-head"><b>${escapeHtml(item["질의 ID"] || "확인 질의")}</b><span>${escapeHtml(item["확인 대상"] || "확인 필요")}</span></div><p>${escapeHtml(item["질의사항"])}</p></div>`
    : "";
  return `<article class="card">
    <div class="meta"><span class="id">${escapeHtml(item["요구사항 ID"])}</span><span class="pill">${escapeHtml(item["적용 서비스"])}</span>${item["상태"] ? `<span class="pill">${escapeHtml(item["상태"])}</span>` : ""}</div>
    <h3>${escapeHtml(item["요구사항명"])}</h3>
    ${row("요청 원문", item["요구사항 원문·요청 내용"])}
    ${row("출처", `${item["출처 파일"]} · ${item["페이지"]}`)}
    ${row("참조 화면", item["참조 HTML"])}
    ${question}
  </article>`;
}

function render() {
  const term = search.value.trim().toLowerCase();
  const service = serviceFilter.value;
  const qState = questionFilter.value;
  const filtered = requirements.filter((item) => {
    const haystack = Object.values(item).filter(Boolean).join(" ").toLowerCase();
    const hasQuestion = Boolean(item["질의사항"]);
    return (!term || haystack.includes(term))
      && (!service || item["적용 서비스"] === service)
      && (!qState || (qState === "yes" ? hasQuestion : !hasQuestion));
  });

  results.textContent = `총 ${filtered.length}건 표시 · 질의 ${filtered.filter((item) => item["질의사항"]).length}건`;
  if (!filtered.length) {
    content.innerHTML = '<div class="empty">검색 조건에 맞는 요구사항이 없습니다.</div>';
    return;
  }

  const groups = new Map();
  filtered.forEach((item) => {
    const key = item["메뉴/화면"] || "기타";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  content.innerHTML = [...groups.entries()].map(([name, items]) => `
    <section class="group">
      <div class="group-head"><h2>${escapeHtml(name)}</h2><span>${items.length}건</span></div>
      <div class="cards">${items.map(card).join("")}</div>
    </section>`).join("");
}

fetch("requirements.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    requirements = data;
    const services = [...new Set(data.map((item) => item["적용 서비스"]).filter(Boolean))].sort();
    serviceFilter.insertAdjacentHTML("beforeend", services.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join(""));
    $("#total-count").textContent = data.length;
    $("#question-count").textContent = data.filter((item) => item["질의사항"]).length;
    $("#screen-count").textContent = new Set(data.map((item) => item["메뉴/화면"])).size;
    render();
  })
  .catch((error) => {
    content.innerHTML = `<div class="empty">요구사항 데이터를 불러오지 못했습니다.<br>${escapeHtml(error.message)}</div>`;
  });

[search, serviceFilter, questionFilter].forEach((control) => control.addEventListener("input", render));
