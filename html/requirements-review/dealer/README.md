# LIN-Q Dealer 운영 화면 HTML 보관본

2026-08-13 기준 운영 Dealer 계정에 노출되는 실제 브라우저 배포 HTML/CSS/JavaScript, 아이콘, 차트 모듈, 폰트, 모델 이미지와 운영 JSON 응답을 함께 보관한 오프라인 회의용 실행본입니다. 화면을 새로 그린 결과물이 아니라 운영 배포 번들을 기준으로 구성했습니다.

## 실행

Node.js 20 이상이 설치된 Windows에서 `start-local.bat`을 실행하거나 이 폴더에서 아래 명령을 실행합니다.

```powershell
npm start
```

그런 다음 [http://localhost:3001/dealer/](http://localhost:3001/dealer/)를 엽니다. 로그인 입력값은 외부로 전송되지 않으며 저장된 딜러 관리자 응답으로 화면이 열립니다. Fleet은 별도 `../fleet` 폴더에서 3000 포트로 실행됩니다.

검증은 아래 명령으로 실행합니다.

```powershell
npm test
```

## 구조

- `assets/`: 운영 배포 JavaScript/CSS, 아이콘, 차트, 로컬 폰트와 이미지
- `dealer-data/`: 딜러 권한으로 확인한 로컬 JSON API 응답
- `page1-fallbacks.json`: 운영 0건 화면에 사용하는 Figma Page 1 기반 회의용 항목
- `server.mjs`: 정적 파일과 로컬 JSON만 제공하는 오프라인 서버
- `local-changes.json`: 수정·저장 버튼으로 변경한 로컬 데이터
- `tests/`: 번들, 보안, 주요 API, 독립 실행 검증
- `qa-report.json`: 주요 딜러 화면 검증 결과
- `mirror-manifest.json`: 운영 배포 파일 다운로드 목록

운영 API 주소를 사용하는 원본 번들은 비교용 `assets/index-dGkWfo-f.original.js`에 보관했고, 실행 번들은 API 주소만 `/api`로 변경했습니다. `server.mjs`에는 운영 서버 프록시나 운영 연결 코드가 없습니다. 수정·저장 요청은 `local-changes.json`에만 기록되고 이후 조회 응답에 합성되며, 취소 버튼은 기록하지 않습니다. 실제 백엔드 연결 시에는 `/api` 재생 계층을 개발 API로 교체하면 됩니다.
