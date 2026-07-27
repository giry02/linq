"use client";

import { useState } from "react";
import {
  equipmentSummary,
  fleetSites,
  profitRanking,
  type FleetSite,
} from "../lib/dashboard-data";

const navItems = ["차량정보", "운행이력", "서비스", "손익관리", "지도", "관리기능"];

function Trend({ direction = "up" }: { direction?: "up" | "down" }) {
  return (
    <span className={`trend trend--${direction}`} aria-label={direction === "up" ? "상승" : "하락"}>
      {direction === "up" ? "↑" : "↓"}
    </span>
  );
}

function SectionTitle({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <h2 className="section-title">
      {children}
      {accent ? <span>{accent}</span> : null}
    </h2>
  );
}

function FleetCard({ site }: { site: FleetSite }) {
  return (
    <article className="site-card">
      <div className="site-card__heading">
        <h3>
          <span className="home-mark" aria-hidden="true" />
          {site.name}
        </h3>
        <div className="equipment-legend" aria-label="장비 유형별 수량">
          <span><i className="dot dot--brand" />엔진 {site.equipment.엔진}</span>
          <span><i className="dot dot--orange" />납축 {site.equipment.납축}</span>
          <span><i className="dot dot--teal" />리튬 {site.equipment.리튬}</span>
          <button className="icon-button" aria-label={`${site.name} 상세 보기`}>›</button>
        </div>
      </div>

      <div className="site-card__profit">
        <div><b>수익률</b><strong>25%</strong><Trend />3.3%</div>
        <div><b>수익금</b><strong>{site.revenue}</strong><Trend />70,000원</div>
      </div>

      <dl className="site-card__metrics">
        <div><dt>가동거리</dt><dd>{site.distance}</dd></div>
        <div><dt>가동시간</dt><dd>{site.runtime}</dd></div>
        <div><dt>충전횟수</dt><dd>{site.chargeCount}</dd></div>
        <div><dt>정비</dt><dd>{site.maintenance}</dd></div>
        <div><dt>차량에러</dt><dd>{site.errors}</dd></div>
      </dl>

      <div className="site-card__footer">
        <b>소모품 관리</b>
        <span>교체필요 <em className="badge badge--danger">{site.replaceNeeded}</em></span>
        <span>교체임박 <em className="badge badge--warn">{site.replaceDue}</em></span>
        <button className="icon-button" aria-label={`${site.name} 소모품 관리 보기`}>›</button>
      </div>
    </article>
  );
}

function MetricCard({
  type,
  direction = "up",
}: {
  type: string;
  direction?: "up" | "down";
}) {
  return (
    <article className={`metric-card ${type === "합계" ? "metric-card--total" : ""}`}>
      <h3>{type}</h3>
      <p>수익률</p>
      <strong>25%</strong>
      <div><Trend direction={direction} />3.3%</div>
      <p>수익금</p>
      <strong>3,707,000원</strong>
      <div><Trend direction={direction === "up" ? "up" : "down"} />1,470,000원</div>
    </article>
  );
}

export function LinqDashboard() {
  const [rankingPage, setRankingPage] = useState(0);

  const ranking = rankingPage === 0 ? profitRanking : [...profitRanking].reverse();

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="LIN-Q 홈">
          <span className="brand__symbol" aria-hidden="true">Q</span>
          <span className="brand__word">Bobcat</span>
          <span className="brand__product">LIN-Q</span>
        </a>
        <nav aria-label="주요 메뉴">
          {navItems.map((item) => (
            <a href={`#${item}`} key={item}>{item}</a>
          ))}
        </nav>
        <div className="account">
          <span>닉네임</span><i />
          <button>↪ 로그아웃</button>
        </div>
      </header>

      <main>
        <section className="dashboard-grid dashboard-grid--hero" aria-label="보유 현황과 순위">
          <article className="panel inventory">
            <SectionTitle>보유현황 2월</SectionTitle>
            <div className="inventory__body">
              <div className="donut-wrap">
                <div className="donut" aria-label="총 보유 장비 1601대">
                  <strong>1601</strong>
                </div>
                <span className="donut-label donut-label--a"><b>430</b><small>20%</small></span>
                <span className="donut-label donut-label--b"><b>824</b><small>45%</small></span>
                <span className="donut-label donut-label--c"><b>500</b><small>35%</small></span>
              </div>
              <div className="inventory-bars">
                {equipmentSummary.map((item) => (
                  <div className="inventory-row" key={item.type}>
                    <b>{item.type}</b>
                    <div className="bar-pair">
                      <div><span>렌탈</span><i><em style={{ width: `${item.active / 8}%`, background: item.color }} /></i><small>{item.active}</small></div>
                      <div><span>대기</span><i><em style={{ width: `${item.idle / 4}%` }} /></i><small>{item.idle}</small></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="panel ranking-panel">
            <div className="ranking-column">
              <SectionTitle accent="TOP5">수익률 </SectionTitle>
              <ol>
                {ranking.map((company, index) => (
                  <li className={index === 0 ? "is-leading" : ""} key={company}>
                    <b>{index + 1}.</b><span>{company}</span><em>{index < 3 ? (index === 1 ? "↓" : "↑") : "–"}</em>
                  </li>
                ))}
              </ol>
            </div>
            <div className="ranking-column">
              <SectionTitle accent="TOP5">채권 우려 업체 </SectionTitle>
              <ol>
                {ranking.map((company, index) => (
                  <li className={index === 0 ? "is-leading" : ""} key={company}>
                    <b>{index + 1}.</b><span>{company}</span><em>{index < 3 ? (index === 1 ? "↓" : "↑") : "–"}</em>
                  </li>
                ))}
              </ol>
            </div>
            <div className="ranking-actions">
              <div>
                <button onClick={() => setRankingPage(0)} aria-label="이전 순위">‹</button>
                <button onClick={() => setRankingPage(1)} aria-label="다음 순위">›</button>
              </div>
              <button>전체보기</button>
            </div>
          </article>
        </section>

        <section className="dashboard-grid dashboard-grid--metrics" aria-label="수익 지표">
          <div className="metric-cards">
            <MetricCard type="엔진" />
            <MetricCard type="납축" direction="down" />
            <MetricCard type="리튬" />
            <MetricCard type="합계" />
          </div>
          <article className="panel sales-chart">
            <SectionTitle>매출비중 <small>– 전월대비(%)</small></SectionTitle>
            <div className="sales-chart__bars" aria-label="유형별 매출 비중">
              {["엔진", "납축", "리튬"].map((type) => (
                <div className="sales-group" key={type}>
                  <div className="sales-bar sales-bar--previous"><span>30%</span></div>
                  <div className="sales-bar sales-bar--current"><span>100%</span></div>
                  <b>{type}</b>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="sites-grid" aria-label="사업장별 운영 현황">
          {fleetSites.map((site) => <FleetCard site={site} key={site.name} />)}
        </section>
      </main>

      <aside className="quick-rail" aria-label="긴급 현황">
        <button><span>⚙</span><b>11</b><small>정비</small></button>
        <button><span>△</span><b>5</b><small>에러</small></button>
        <button><span>⌁</span><b>8</b><small>충격</small></button>
      </aside>

      <footer>
        <div className="doosan-word">DOOSAN</div>
        <div>
          <p><b>이용약관</b><b>개인정보 처리방침</b></p>
          <small>©두산산업차량 주식회사. ALL RIGHTS RESERVED.</small>
        </div>
        <div className="help"><i /><p><b>HELP</b><span>admin.linq@doosan.com</span></p></div>
      </footer>
    </div>
  );
}
