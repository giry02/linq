# LIN-Q 화면 구조

## 현재 구현 범위

- 화면 ID: `R-MA-01-01-00`
- 화면명: 통합 관제 메인
- 기준 시안: 확정본 `R-MA-01-01-00.png`
- 기획 표현: 기능 시나리오 PPT의 화면 캡처 + 번호형 설명 블록 형식

## HTML 구조

```text
app/
├─ page.tsx                         # 메인 진입점
├─ layout.tsx                       # 공통 문서/메타데이터
├─ globals.css                      # 디자인 토큰과 전체 반응형 스타일
├─ components/
│  └─ LinqDashboard.tsx             # 메인화면 조합
└─ lib/
   └─ dashboard-data.ts             # 장비·지점·지표 데이터 모델
```

`LinqDashboard`는 다음 UI 블록으로 나뉜다.

1. Global Navigation
2. Equipment Overview
3. Ranking
4. KPI Cards
5. Sales Trend
6. Fleet Site Cards
7. Quick Action Rail
8. Footer

## 화면 코드 규칙

```text
{권한}-{업무영역}-{대메뉴}-{중메뉴}-{화면순번}
R-MA-01-01-00
│  │  │  │  └─ 화면 순번
│  │  │  └──── 중메뉴
│  │  └─────── 대메뉴
│  └────────── Main
└───────────── 역할/권한
```

후속 화면은 동일한 규칙으로 추가하고, 각 화면의 루트 프레임과 React 컴포넌트 이름에 화면 ID를 함께 기록한다.

## 디자인 토큰

| 역할 | 값 |
| --- | --- |
| Brand Red | `#FF3600` |
| Deep Navy | `#222F45` |
| Data Teal | `#00AA87` |
| Data Orange | `#FF9738` |
| Canvas | `#F5F6F7` |
| Surface | `#FFFFFF` |

## Figma 구조

```text
01 메인화면
└─ R-MA-01-01-00 / 메인화면 기획 보드
   ├─ Planning Header
   └─ Main Screen + Specification
      ├─ LIN-Q | 통합 관제 대시보드
      └─ Specification Rail
         ├─ 00 화면 정의
         ├─ 01 주요 콘텐츠 영역
         ├─ 02 인터랙션 규칙
         └─ 03 Brand Tokens
```

피그마 후속 기획서는 화면별 보드를 복제한 뒤 화면 ID, 콘텐츠 맵, 인터랙션 규칙만 갱신하는 방식으로 확장한다.
