# LIN-Q HTML Mirror

LIN-Q 플릿·딜러 운영 화면을 로컬 JSON 데이터로 확인하고 수정하기 위한 HTML 미러입니다. 실제 운영 서버와는 연결하지 않습니다.

## 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000/](http://localhost:3000/)을 열면 플릿·딜러 선택 화면이 표시됩니다.

- 플릿: `http://localhost:3000/fleet/ko/login`
- 딜러: `http://localhost:3001/dealer/ko/login`

루트 선택 화면은 인증 검사를 수행하지 않습니다. 서비스를 선택한 뒤 각 로그인 화면에서 시작하므로, 인증 정보가 없는 초기 진입에서 브라우저 기본 경고창이 나타나지 않습니다.

## 폴더 구조

- `html/fleet`: 플릿 HTML, 이미지·폰트·로컬 JSON fixture, 로컬 API 서버
- `html/dealer`: 딜러 HTML, 이미지·폰트·로컬 JSON fixture, 로컬 API 서버
- `html/index.html`: 플릿·딜러 선택 화면
- `scripts/start-html.mjs`: 플릿(3000)과 딜러(3001) 서버 동시 실행
- `storyboard`: LIN-Q 스토리보드 산출물

## 참고

정적 파일만 제공하는 GitHub Pages에서는 Node 기반 로컬 JSON API가 실행되지 않습니다. 전체 데이터와 기능을 확인하려면 저장소를 내려받아 `npm start`로 실행해야 합니다.
