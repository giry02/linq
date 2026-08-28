# MACHINE IQ 완료 작업본

## 작업 원칙

- `html/fleet`, `html/dealer`, `html/requirements-review` 원본은 수정하지 않는다.
- 요구사항으로 변경한 화면과 기능은 현재 확정 상태 그대로 포함한다.
- 검토용 빨간 번호, 문제점 패널, 요구사항 설명 오버레이는 완료 작업본에 표시하지 않는다.
- 추가 보완은 요구사항에서 이미 바꾼 화면을 재설계하지 않고 차량정보, 대시보드 잔여 영역, 지도, 리포트, 관리기능, 공통 상태 처리에만 적용한다.
- 기존 번들, 에셋, 로컬 JSON API, 메뉴 라우터를 유지한다.

## 구성

- `fleet/`: 플릿 완료 작업본
- `dealer/`: 딜러 완료 작업본
- `requirements-mvp/`: 기존 요구사항 추적·비교본 보관
- `index.html`: 플릿·딜러 진입 선택 화면

## 실행

플릿:

```powershell
$env:PORT=3210
node html/final-implementation/fleet/server.mjs
```

딜러:

```powershell
$env:PORT=3211
node html/final-implementation/dealer/server.mjs
```

브라우저 경로:

- 플릿: `http://localhost:3210/fleet/ko/page/dashboard/widget`
- 딜러: `http://localhost:3211/dealer/ko/page/dashboard/widget-company`

## 요구사항 반영 코드

- `final-requirements-shell.*`: 확정된 GNB, 조회 대상, LNB 구조와 실제 메뉴 이동
- `final-requirement-pages.*`: 서비스·운행이력·차량목록·대시보드 요구사항 반영
- `final-additional-enhancements.*`: 요구사항 외 잔여 화면의 최소 범위 보완
- `final-bootstrap.js`: 완료 작업본의 로컬 API 세션 준비 및 직접 경로 진입

번호와 변경 설명은 실제 구현 완료 후 별도 추적 문서에서 부여한다.
