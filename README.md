# LIN-Q MachineIQ 로컬 HTML

운영 Fleet/Dealer 화면을 로컬 JSON 데이터로 재생하는 오프라인 HTML과 요구사항 검토 화면, Dealer 모바일 웹 시안을 보관합니다. 운영 서버에는 연결하지 않습니다.

## 실행

Node.js 20 이상에서 각 서버를 실행합니다.

```powershell
npm run start:fleet
npm run start:dealer
npm run start:requirements
```

## 주요 주소

- Fleet: `http://localhost:3000/fleet/`
- Dealer: `http://localhost:3001/dealer/`
- Dealer 모바일 웹: `http://localhost:3001/dealer/mobile-home/`
- 요구사항 전체 목록: `http://localhost:3100/requirements-mvp/`

## 폴더

- `html/fleet`: Fleet 로컬 실행본
- `html/dealer`: Dealer 로컬 실행본 및 모바일 웹
- `html/requirements-review`: 원본 실행본과 분리한 요구사항 검토 화면
- `manual`: Fleet/Dealer 한·영문 사용자 매뉴얼
- `scripts`: 실행 및 검증 보조 스크립트

## 검증

```powershell
npm test
npm run qa:fleet
npm run qa:dealer
```

로그인 입력값과 수정 데이터는 외부로 전송되지 않습니다. 화면 데이터는 로컬 JSON fixture에서 재생되며, 실제 백엔드 연결 시 로컬 API 계층을 개발 API로 교체할 수 있습니다.
