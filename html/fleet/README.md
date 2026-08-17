# LIN-Q Fleet 운영 화면 HTML 보관본

운영 Fleet 웹의 브라우저용 HTML/CSS/JavaScript, 아이콘, 차트 모듈, 폰트, 이미지와 2026-08-13 기준 로컬 JSON 응답을 함께 보관한 오프라인 회의용 실행본입니다. React로 다시 그린 화면이 아니라 운영 배포 번들을 기준으로 구성했습니다.

## 실행

Node.js 20 이상이 설치된 Windows에서 `start-local.bat`을 실행하거나, 이 폴더에서 아래 명령을 실행합니다.

```powershell
npm start
```

그런 다음 [http://localhost:3000/fleet/](http://localhost:3000/fleet/)을 엽니다. 로그인 입력값은 로컬 서버 밖으로 전송되지 않으며, 저장된 로컬 관리자 응답으로 화면이 열립니다.

검증은 다음 명령으로 실행합니다.

```powershell
npm test
```

## 폴더 구조

- `fleet/`: 운영 배포 HTML/CSS/JavaScript와 로컬 폰트·이미지
- `fleet-data/`: 운영 화면에서 확인한 로컬 JSON API 응답
- `page1-fallbacks.json`: 운영 0건 화면에 사용하는 Figma Page 1 기반 회의용 항목
- `server.mjs`: 정적 파일과 로컬 JSON만 제공하는 무의존성 서버
- `local-changes.json`: 수정·저장 버튼으로 변경한 로컬 데이터
- `tests/`: 구조, 보안, API 재생 검증
- `qa-report.json`: 브라우저 주요 화면 검증 결과

## 구현 기준

- 작업용 번들의 API 주소만 `/api`로 바꿨으며 `fleet/assets/index-dGkWfo-f.original.js`에는 비교용 운영 원본을 보존했습니다.
- 로컬 서버에는 운영 API로 프록시하거나 전송하는 코드가 없습니다.
- 수정·저장 요청은 성공 응답을 반환하고 `local-changes.json`에만 기록되며, 이후 조회 응답에도 로컬 변경값을 합성합니다. 취소 버튼은 기록하지 않습니다.
- Noto Sans KR/Open Sans와 차량 이미지는 로컬 자산으로 저장했습니다.
- Google Maps 운영 키는 localhost 사용이 제한되므로, 지도와 Geofence에는 운영 도메인에서 직접 캡처한 실제 지도 영역을 자동 대체 표시합니다. 지도 주변 UI와 장비 목록은 운영 코드 및 로컬 JSON 그대로입니다.
- 수소배터리·정비 이력 등 운영 0건 목록은 `page1-fallbacks.json`의 회의용 항목을 현재 운영 레이아웃에 표시합니다.

나중에 실제 서버를 연결할 때는 `/api` 로컬 재생 계층을 개발 API 계층으로 교체하면 됩니다.
