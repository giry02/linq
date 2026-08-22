(() => {
  const screen = document.body.dataset.requirementScreen;
  const app = document.getElementById('req-app');
  const dataOnly = document.body.dataset.requirementDataOnly === 'true';
  if ((!screen || !app) && !dataOnly) return;

  const operationRates = [68,72,65,74,78,81,76,69,73,79,82,77,71,75,80,84,78,74,69,73,76,81,85,83,77,72,75,79,82,80,74];
  const fuelRates = [4.1,3.8,4.5,4.3,4.0,4.7,5.1,4.8,4.2,3.9,4.4,4.6,5.0,4.7,4.1,3.7,4.0,4.3,4.8,5.2,4.9,4.5,4.2,3.8,4.1,4.6,4.7,5.0,4.4,4.2,3.9];
  const shockValues = [0,1,0,3,2,0,4,1,0,2,1,0,0,3,1,2,0,1,5,2,0,1,0,4,2,1,0,0,3,1,0];
  const chargeValues = [72,76,61,84,68,79,88,74,69,82,77,86,71,80];
  const dischargeValues = [38,45,52,41,47,43,36,50,55,42,46,39,51,44];
  const tempValues = [31,32,33,31,34,35,33,32,36,34,33,35,32,31];

  const reviewGuide = {
    'service-errors': [
      {ppt:'PPT 2p',id:'R-SVC-001~004',request:'서비스 상단 활성 표시를 맞추고, 최초 조회를 일 단위로 변경한다. 사용자설정 버튼을 먼저 누르지 않아도 날짜를 직접 입력하며 허용 기간을 안내한다.',implementation:'기존 GNB 구조는 유지하고 활성 밑줄 기준을 통일했다. 일 버튼을 기본 활성화하고 날짜 입력 즉시 사용자설정으로 전환되며 최대 31일 안내를 표시했다.',location:'상단 GNB와 우측 기간 필터',status:'UI 적용'},
      {ppt:'PPT 2p',id:'R-SVC-005~007',request:'서비스 상단 현황의 전체 집계와 배터리 에러 항목을 빼고, 배터리·엔진 오류를 기존 차량 에러에 합친 뒤 배터리에러 별도 메뉴를 제거한다.',implementation:'서비스 LNB와 업체 전체 조회는 유지했다. 상단의 배터리 에러 건수는 차량 에러에 합산하고 별도 항목을 제거했으며, 차량 에러 표에서 배터리·엔진 오류를 함께 표시했다.',location:'서비스 상단 차량 에러 현황, 좌측 메뉴, 기존 차량 에러 표',status:'UI 적용 / API 필요'},
      {ppt:'PPT 2p',id:'R-SVC-008~009',request:'첨부 PDF가 있는 행에만 PDF 아이콘을 표시하고, 기존 중요도 열은 차량·배터리 오류를 구별하는 구분 열로 변경한다.',implementation:'PDF가 있는 표본 행만 PDF 문서 아이콘으로 바꾸고 나머지는 기존 상세보기 아이콘을 유지했다. 중요도 열은 구분으로 변경했으며 BMS·배터리 오류는 배터리, 그 외 오류는 차량으로 표시했다.',location:'플릿 차량 에러 표의 구분·조치방법 열',status:'UI 적용 / 오류 원천 매핑 API 확인 필요'},
    ],
    'maintenance-history': [
      {ppt:'PPT 3p',id:'R-MNT-001',request:'정비 이력에 Claim 번호를 추가한다.',implementation:'Claim 번호 열은 화면에 표시했다. 실제 값을 임의 생성하지 않고 수리 ID 확인 필요로 표시했으며, 수리 ID가 Claim과 동일한 업무 건 식별자인지 API·업무 확인 후 매핑한다.',location:'플릿 정비 이력 표의 Claim 번호 열',status:'UI 적용 / 업무·데이터 확인 필요'},
      {ppt:'PPT 3p',id:'R-MNT-002~004',request:'플릿 고객 화면의 정비 내용은 현상까지만 보여주고 상세내용은 노출하지 않는다. 접수 일시는 정비 일시로, 완료 일시는 완료 여부로 변경한다.',implementation:'상세내용 열은 제거했다. 정비 일시는 기존 접수 일시 값을 표시하고, 완료 여부는 완료 일시 존재 여부에 따라 O/X로 표시했다.',location:'플릿 정비 이력 표의 현상·정비 일시·완료 여부 열',status:'UI 적용 / 필드 권한 API 필요'},
      {ppt:'PPT 3p',id:'R-MNT-005~007',request:'등록·수정·삭제를 제거하고 서비스 하위 목록 정렬을 그룹/고객명→기종→호기로 통일한다.',implementation:'목록을 읽기 전용으로 구성하고 편집 버튼을 제거했다. 표본 행도 요청된 복합 정렬 기준으로 배치했다.',location:'정비 이력 표 전체와 우측 정렬 안내',status:'UI 적용 / 서버 정렬 필요'}
    ],
    'operation-shock': [
      {ppt:'PPT 4p',id:'R-OPS-001',request:'수소배터리를 운행이력 1차 하위 메뉴에서 빼고 한 단계 더 들어가서 제공한다.',implementation:'좌측 메뉴에서 수소배터리를 제거했다. 수소 차량 FHA30-000101의 차량 상세보기를 펼친 경우에만 수소 시스템 상세 진입 링크가 나타난다.',location:'운행이력 좌측 메뉴와 화면 하단 차량 상세보기',status:'UI 적용 / 라우트 필요'}
    ],
    'operation-efficiency': [
      {ppt:'PPT 5p',id:'R-OPS-002',request:'월 선택 시 월 평균 그래프로 보여질 수 있도록 한다.',implementation:'일·주·월 선택값에 맞춰 해당 기간의 운영효율 그래프를 표시하며, 월 선택 시 월 평균 운영효율을 상단에 표시한다.',location:'상단 기간 선택과 운영효율 그래프',status:'UI 적용 / 평균 산식 확인 필요'},
      {ppt:'PPT 5p',id:'R-OPS-003',request:'% 외에 실제 작업시간을 숫자로 추가하고 일·주·월 선택에 따라 해당 기간의 값을 보여준다.',implementation:'그래프 상단과 날짜별 행에 실제 작업시간을 숫자로 표시하고 기간 선택에 따라 값을 변경한다.',location:'그래프 상단 기간 요약과 날짜별 실제 작업시간',status:'UI 적용 / 시간 단위 계약 필요'},
      {ppt:'PPT 5p',id:'R-OPS-004',request:'31일까지 보기 위해 가로 스크롤하지 않도록 한다. 필요하면 가로축과 세로축을 변경할 수 있다.',implementation:'날짜를 세로로 나열하고 0~100% 효율을 가로 막대로 배치해 31일까지 가로 스크롤 없이 확인하도록 했다. 축 변경은 별도 요구사항이 아니라 이 요청의 구현 방식이다.',location:'운영효율 그래프 1~31일',status:'UI 적용'}
    ],
    'engine-efficiency': [
      {ppt:'PPT 6p',id:'R-OPS-006',request:'이름을 ‘엔진’에서 ‘엔진 연비’로 변경한다.',implementation:'기존 경로와 기능은 유지하고 동일한 다국어 키를 좌측 메뉴·화면 제목·breadcrumb에서 공통 사용한다. 한국어는 ‘엔진 연비’, 영어는 ‘Engine Fuel Efficiency’로 변경한다.',location:'좌측 메뉴와 화면 상단',status:'UI 적용 / i18n 리소스 변경 필요'},
      {ppt:'PPT 6p',id:'R-OPS-007',request:'월 연비 그래프를 31일까지 가로스크롤 없이 표시한다.',implementation:'31개 일별 연비 막대를 본문 폭 안에 배치하고 날짜·L/h 값을 롤오버 툴팁으로 제공한다.',location:'일별 엔진 연비 그래프',status:'UI 적용'},
      {ppt:'추가 요청',id:'R-OPS-008',request:'연비 데이터가 비어 있어도 화면설계 검토가 가능하도록 그래프 형태와 값 표시 예시를 보여준다.',implementation:'원본 차트에 0이 아닌 값이 없을 때만 1~31일 축과 16일 4.0L/H 예시값을 표시하는 폴백 그래프를 적용한다. 실제 연비값이 수신되면 원본 차트를 유지한다.',location:'연비 현황 그래프',status:'UI 적용 / 실제 데이터 수신 시 원본 차트 사용'},
      {ppt:'검토 질문',id:'Q-OPS-001',request:'연비 현황 Y축에 2·1·1·0·-1·-1처럼 중복·음수 눈금이 나타나는 것이 정상인지 확인한다.',implementation:'화면 값을 임의로 보정하지 않고 Y축 최소·최대값, 눈금 간격, 소수점 표시 기준을 확인 질문으로 남겼다.',location:'연비 현황 그래프의 좌측 Y축 눈금',status:'질문 / 데이터·차트 기준 확인 필요'}
    ],
    'lithium-battery': [
      {ppt:'PPT 7p',id:'R-BAT-001',request:'리튬배터리 상세 화면 하단의 에러 정보 영역을 삭제한다. 에러 정보는 서비스의 차량 에러 화면에 통합하여 별도로 표시하지 않는다.',implementation:'운영의 FBA34_224030249 조회값(잔여 배터리 100%, 상태 정상, 작업 가능 3시간 48분, 시간당 사용 8.374kWh, 성능상태 98%)과 8월 충·방전 및 온도 범위를 로컬 화면에 반영하고, 하단 에러 정보 섹션만 제거했다.',location:'리튬배터리 상세 요약·충방전·온도 그래프 및 화면 하단',status:'UI 적용 / 운영 조회값 반영 / 중복 오류 API 호출 제거 필요'},
      {ppt:'PPT 7p',id:'R-BAT-002',request:'배터리 충전·방전량 정보와 온도 정보를 한 화면에서 함께 비교할 수 있는지 검토한다.',implementation:'충·방전량과 온도는 단위와 값의 범위가 달라 하나의 그래프에 중첩할 경우 표현이 복잡해지고 사용자가 한눈에 비교하기 어렵다. 동일 조회기간을 공유하는 두 그래프를 좌우에 배치하고 날짜 선택과 롤오버를 연동하는 비교안을 별도 페이지로 제공한다.',location:'별도 좌우 그래프 비교안',status:'검토 의견 / 좌우 병렬 비교안 제공'}
    ],
    'home-vehicles': [
      {ppt:'PPT 8p',id:'R-HOME-001',request:'고객 동의가 완료되지 않은 차량은 홈/차량 목록에 보이지 않게 한다.',implementation:'목록 제목을 고객 동의 완료 차량으로 명시하고 동의 완료 결과만 렌더링했다. 원천 데이터 삭제가 아닌 서버 필터 방식이 필요하다.',location:'전체 차량 제목과 결과 목록',status:'결과 UI 적용 / 서버 필터 필요'},
      {ppt:'PPT 9p',id:'R-HOME-002',request:'재판매 Delivery Report 수신 시 해당 장비의 End Customer를 갱신한다.',implementation:'별도의 소유 이력 UI를 새로 만들지 않는다. SAP Delivery Report 수신 후 기존 차량 목록이 변경된 End Customer 기준으로 조회되는 결과만 확인한다.',location:'홈 화면의 업체·차량 목록 결과',status:'프론트 추가 UI 없음 / SAP 연동 필요'}
    ],
    'supplies-management': [
      {ppt:'PPT 10p',id:'R-SUP-001~002',request:'수정 버튼을 리셋으로 바꾸고 리셋 입력 팝업을 제거한다.',implementation:'각 행의 관리 버튼을 리셋으로 변경했다. 클릭하면 별도 입력 팝업 없이 즉시 처리하고 완료 토스트를 표시한다.',location:'소모품 표 우측 리셋 버튼',status:'UI 적용 / 감사이력 필요'},
      {ppt:'PPT 10p',id:'R-SUP-003',request:'소모품 리셋은 딜러 대표와 본사 서비스 역할만 실행할 수 있어야 한다.',implementation:'화면 표본은 딜러 대표 권한으로 표시했다. 딜러 대표·본사 서비스 두 역할만 허용하는 서버 액션 권한이 필요하다.',location:'화면 제목의 딜러 대표, 리셋 버튼',status:'권한 API 필요'},
      {ppt:'PPT 10p',id:'R-SUP-004',request:'리셋할 때 관리 시작 시점을 갱신한다.',implementation:'리셋 버튼 클릭 시 해당 행의 관리 시작 시점을 현재 시각으로 변경하고 버튼 상태를 리셋 완료로 바꾼다.',location:'관리 시작 시점 열과 리셋 버튼',status:'UI 적용 / 기준값 저장 필요'}
    ],
    'dashboard': [
      {ppt:'PPT 11p',id:'R-DSH-002',request:'대시보드 지도 위젯에 전체화면 보기 아이콘을 제공한다.',implementation:'지도 카드 우측 상단 아이콘을 누르면 지도 위젯만 브라우저 영역에 확대한다. 다시 누르거나 ESC를 누르면 원래 크기로 복귀한다. “테스트그룹 차량인가요?”는 확인 질문이므로 UI 요구사항으로 구현하지 않았다.',location:'대시보드 지도 위젯 우측 상단',status:'UI 적용 / 표본 차량은 별도 확인'}
    ]
  };

  const requirementIssueIds = {
    'R-SVC-001':['P-013'], 'R-SVC-002':['P-012'], 'R-SVC-003':['P-012'], 'R-SVC-004':['P-012'],
    'R-SVC-005':[], 'R-SVC-006':['P-002','P-003','P-025'], 'R-SVC-007':['P-021'],
    'R-SVC-008':['P-008'], 'R-SVC-009':['P-002'],
    'R-MNT-001':['P-005'], 'R-MNT-002':['P-007','P-024'], 'R-MNT-003':['P-006'], 'R-MNT-004':['P-006'],
    'R-MNT-005':['P-024'], 'R-MNT-006':['P-024'], 'R-MNT-007':['P-010','P-023'],
    'R-OPS-001':['P-021'], 'R-OPS-002':['P-011','P-012'], 'R-OPS-003':['P-011'], 'R-OPS-004':['P-013'],
    'R-OPS-006':[], 'R-OPS-007':['P-013'], 'R-OPS-008':[],
    'R-BAT-001':[], 'R-BAT-002':[],
    'R-HOME-001':['P-015'], 'R-HOME-002':['P-016','P-023'],
    'R-SUP-001':['P-017','P-018'], 'R-SUP-002':['P-017'], 'R-SUP-003':['P-007','P-019'], 'R-SUP-004':['P-017','P-018'],
    'R-DSH-002':['P-013'],
  };

  const problemCatalog = {
    'P-002':{severity:'높음',title:'BMS·리튬·J1939 오류의 상태 모델이 서로 다름',detail:'UI만 통합하면 완료·코드·중복 판정 기준이 충돌합니다.',impact:'잘못된 통합 상태와 중복 행으로 서비스 판단 오류가 발생할 수 있습니다.',decision:'통합 표준 DTO와 sourceType·statusReason을 정의해야 합니다.'},
    'P-003':{severity:'치명',title:'J1939 DM1에는 종료 이벤트가 없음',detail:'미수신만으로는 해결·Key-Off·통신유실·전원차단을 구분할 수 없습니다.',impact:'허위 정상·과거 판정으로 안전과 서비스 신뢰가 훼손될 수 있습니다.',decision:'단기 불확정 상태 또는 장기 Clear 신호 정책을 승인해야 합니다.'},
    'P-004':{severity:'높음',title:'10초 미수신 대안과 현행 24시간 과거 규칙 충돌',detail:'두 임계값을 같은 상태명에 적용하면 서로 다른 결과가 나옵니다.',impact:'통신 품질에 따라 상태가 반복 변경되거나 장기 오표시될 수 있습니다.',decision:'sourceType별 임계값·상태명·타임존·Key-Off 처리를 확정해야 합니다.'},
    'P-005':{severity:'높음',title:'Claim과 수리 ID의 동일성 미확정',detail:'테이블 명세에 Claim 명칭의 컬럼은 없지만 수리 ID가 확인되어 가장 가까운 후보입니다. 다만 수리 ID가 고객 Claim과 같은 업무 건을 식별하는 값인지, 정비 이력 전체에서 유일하고 누락 없이 제공되는지는 확인되지 않았습니다.',impact:'확인 없이 수리 ID를 Claim 번호로 표시하면 서로 다른 업무 식별자를 같은 값으로 오인할 수 있습니다.',decision:'업무 담당자와 백엔드에서 ① Claim = 수리 ID인지 ② 수리 ID의 유일성·필수 여부 ③ 정비 이력 API 제공 여부를 확인합니다. 동일하면 기존 수리 ID를 매핑하고, 다르면 Claim 원천·신규 컬럼·API가 필요하므로 난이도는 높음입니다.'},
    'P-006':{severity:'높음',title:'정비일시 라벨과 접수일시 값의 의미 차이',detail:'PPT는 표시명을 정비일시로 바꾸되 날짜 값은 접수일시 기준을 사용하도록 명시합니다.',impact:'사용자가 실제 정비 시작시각으로 오해할 수 있습니다.',decision:'정비일시의 화면 용어 정의에 “접수일시 기준”을 명시할지 승인해야 합니다.'},
    'P-007':{severity:'높음',title:'고객·딜러대표·본사서비스 역할 식별 미확정',detail:'자연어 역할을 ROLE_ID와 업체 관계에 정확히 매핑할 수 없습니다.',impact:'권한이 과다 노출되거나 정상 사용자가 차단될 수 있습니다.',decision:'역할 ID와 회사 종류·상하관계를 승인해야 합니다.'},
    'P-008':{severity:'높음',title:'PDF 첨부 연결·권한·실재성 부족',detail:'FILE_ID만 확인할지 실제 파일 존재까지 검증할지 불명확합니다.',impact:'깨진 링크 또는 무권한 파일 노출이 발생할 수 있습니다.',decision:'첨부 업무·파일유형·접근권한·URL 만료 정책을 결정해야 합니다.'},
    'P-009':{severity:'중간',title:'중요도 null 처리 정책 미정',detail:'컬럼 전체 숨김과 행 단위 - 표시는 의미가 다릅니다.',impact:'필터·정렬·보고서의 결과가 일치하지 않을 수 있습니다.',decision:'시스템 전체 미제공과 행별 미제공 정책을 분리해야 합니다.'},
    'P-010':{severity:'중간',title:'공통 정렬 업무키와 null 규칙 불명확',detail:'딜러의 업체·고객 기준과 플릿의 그룹 기준이 서로 다릅니다.',impact:'페이지 간 순서 변화와 중복·누락이 발생할 수 있습니다.',decision:'사이트별 1차 키·정렬방향·null·한글정렬 규칙을 확정해야 합니다.'},
    'P-011':{severity:'높음',title:"'월 평균' 계산 정의 불명확",detail:'일별 비율의 단순평균과 총 작업·운영시간의 가중평균은 결과가 다릅니다.',impact:'대시보드와 리포트의 수치가 불일치할 수 있습니다.',decision:'분자·분모와 그룹·차량 집계 공식을 승인해야 합니다.'},
    'P-012':{severity:'높음',title:'일·주·월 집계와 시간 단위 계약 부족',detail:'API workingTime 숫자와 DB 초 단위가 혼용될 수 있습니다.',impact:'시간이 3600배 어긋나거나 비율이 달라질 위험이 있습니다.',decision:'API 단위·주 시작일·휴일·타임존을 정의해야 합니다.'},
    'P-013':{severity:'중간',title:'31일 무스크롤 기준 해상도·표현 규칙 미정',detail:'축 교환 여부와 최소 지원 해상도가 정해지지 않았습니다.',impact:'레이블 겹침과 값 판독성 저하가 발생할 수 있습니다.',decision:'1920·1680 기준과 툴팁·간격 규칙을 승인해야 합니다.'},
    'P-014':{severity:'높음',title:'선택 차량의 배터리 그래프 값이 다수 null',detail:'UI 배치 전에 실데이터 가용성과 샘플링 조건 검증이 필요합니다.',impact:'빈 그래프가 유지되어 회의와 기능 검증이 어려워집니다.',decision:'데이터가 있는 표본 차량·기간과 결측 처리를 결정해야 합니다.'},
    'P-015':{severity:'치명',title:"'아예 지울것'이 삭제인지 노출 제외인지 모호",detail:'물리 삭제는 이력·서비스·규제 추적을 훼손할 수 있습니다.',impact:'데이터 손실 또는 미동의 정보 노출이 발생할 수 있습니다.',decision:'UI·API 제외로 정의하고 원천 보존 여부를 승인해야 합니다.'},
    'P-016':{severity:'높음',title:'재판매 Delivery Report 트리거·이력 계약 없음',detail:'End Customer 갱신·취소·재처리 규칙이 명세되지 않았습니다.',impact:'잘못된 고객 귀속과 접근권한 오류가 발생할 수 있습니다.',decision:'SAP 인터페이스 이벤트 스키마와 소유권 이력을 정의해야 합니다.'},
    'P-017':{severity:'높음',title:'팝업 없는 리셋은 오조작 위험',detail:'누적 기준 변경은 서비스 판단에 영향을 주는 상태 변경입니다.',impact:'실수로 교환주기와 도래 상태가 초기화될 수 있습니다.',decision:'확인창 포함 여부와 취소·되돌리기 정책을 결정해야 합니다.'},
    'P-018':{severity:'치명',title:"'관리 시작 시점' 정의 없음",detail:'사이트 등록일·그룹 등록일·단말 설치일·마지막 교환일 중 기준이 불명확합니다.',impact:'남은시간과 도래율이 크게 달라질 수 있습니다.',decision:'업무 기준일과 누적시간 스냅샷 원천을 승인해야 합니다.'},
    'P-019':{severity:'높음',title:'소모품 리셋 액션 권한 모델 없음',detail:'메뉴 조회권한과 리셋 실행권한은 서로 다른 권한입니다.',impact:'조회 사용자에게 리셋 권한이 상승할 수 있습니다.',decision:'API 정책 또는 action permission 도입을 결정해야 합니다.'},
    'P-020':{severity:'낮음',title:"'테스트그룹차량인가요?'는 요구사항이 아닌 확인 질문",detail:'데이터 수정·기본 선택·문구 변경 중 조치 방향이 정해지지 않았습니다.',impact:'잘못된 범위를 수정할 수 있습니다.',decision:'표본 차량과 기대 그룹을 확인해야 합니다.'},
    'P-021':{severity:'중간',title:'메뉴 삭제·이동·명칭변경 호환정책 부족',detail:'메뉴 변경이 권한·딥링크·스토리보드 ID에 영향을 줍니다.',impact:'기존 북마크 404·권한 누락·문서 불일치가 발생할 수 있습니다.',decision:'리다이렉트·별칭·폐기일 정책을 승인해야 합니다.'},
    'P-022':{severity:'중간',title:'현재 HTML은 캡처 JSON 기반 오프라인 미러',detail:'화면 구조와 응답 형식은 확인할 수 있지만 실서버 권한·배치·실시간 상태는 증명하지 못합니다.',impact:'현재 화면 판정을 운영 완료로 오해할 수 있습니다.',decision:'운영 API·DB 통합 테스트 범위를 별도로 분리해야 합니다.'},
    'P-023':{severity:'높음',title:'호기·equipmentId·equipmentNumber 형식 불일치',detail:'하이픈·언더스코어와 생산번호·표시 호기가 혼용됩니다.',impact:'조인 실패·중복·오류 이력 오연결이 발생할 수 있습니다.',decision:'업무키·표시키·외부키를 정의해야 합니다.'},
    'P-024':{severity:'높음',title:'화면 숨김만으로 필드 제한을 구현할 위험',detail:'고객에게 필드를 숨겨도 API가 반환하면 우회 조회가 가능합니다.',impact:'민감한 정비정보가 노출될 수 있습니다.',decision:'필드 수준 서버 인가 적용 여부를 승인해야 합니다.'},
    'P-025':{severity:'치명',title:'오류 원천을 무시한 단일 상태 라벨 위험',detail:'BMS는 완료를 확정할 수 있지만 DM1은 확정할 수 없습니다.',impact:"같은 '완료'가 서로 다른 신뢰도를 갖게 됩니다.",decision:'sourceType·statusConfidence·statusReason 포함 여부를 결정해야 합니다.'},
    'P-028':{severity:'중간',title:'null·미제공 표기가 SPN/FMI 외 필드에는 정의되지 않음',detail:'중요도·완료일·설명·파일도 null이 될 수 있습니다.',impact:'사용자가 빈칸의 의미를 구분하지 못할 수 있습니다.',decision:"미제공 '-'·해당없음 'N/A'·미확정 '확인중' 규칙을 승인해야 합니다."}
  };

  const severityRank = { '치명':4, '높음':3, '중간':2, '낮음':1 };
  const severityClass = severity => ({'치명':'critical','높음':'high','중간':'medium','낮음':'low'}[severity] || 'medium');
  const issuesForRequirement = id => (requirementIssueIds[id] || []).map(issueId => ({id:issueId,...problemCatalog[issueId]})).filter(issue=>issue.title);
  const highestIssueSeverity = issues => issues.reduce((highest,issue)=>severityRank[issue.severity]>(severityRank[highest]||0)?issue.severity:highest,'');

  const callout = (number,id,ppt,title,request,change,targets,location,status='UI 적용') => ({number,id,ppt,title,request,change,targets:Array.isArray(targets)?targets:[targets],location,status});
  const requirementCallouts = {
    'service-errors': [
      callout(1,'R-SVC-001','PPT 2p','서비스 활성 밑줄 정렬','서비스를 포함한 GNB 활성 밑줄의 위치와 폭을 동일하게 맞춘다.','기존 GNB의 색상·높이는 유지하고 서비스 활성 밑줄을 다른 메뉴와 같은 하단 기준선에 배치했다.','.page-head__nav [data-href="service-errors.html"]','상단 서비스 메뉴','UI 적용'),
      callout(2,'R-SVC-002','PPT 2p','기본 조회 기간을 일로 변경','서비스 화면 최초 진입 시 일 단위 조회가 선택되어야 한다.','페이지 진입 시 일 버튼이 기본 활성 상태가 되도록 변경했다.','.req-period-filter [data-period="day"]','우측 기간 필터의 일 버튼','UI 적용 / API periodType 연결 필요'),
      callout(3,'R-SVC-003','PPT 2p','사용자설정 조회기간 안내','직접 날짜를 정할 때 허용되는 최대 조회기간을 안내한다.','기간 필터 아래에 최대 조회기간 31일 안내를 추가했다.','.period-help','기간 필터 하단 안내문','UI 적용 / 정책값 확정 필요'),
      callout(4,'R-SVC-004','PPT 2p','날짜 직접 입력','사용자설정 버튼을 먼저 누르지 않고 시작일·종료일을 바로 입력한다.','두 날짜 입력칸을 활성화하고 입력이 발생하면 사용자설정 버튼이 자동 활성화되도록 변경했다.','.req-period-filter','우측 날짜 입력 영역','UI 적용'),
      callout(5,'R-SVC-005','PPT 2p','상단 전체 집계 제거','서비스 상단 현황에서 전체 건수 집계 항목만 제거한다.','서비스 LNB와 업체 전체 조회는 유지하고 상단 현황의 전체 집계 카드만 제거했다.','.srvc-tab','서비스 상단 현황 영역','UI 적용'),
      callout(6,'R-SVC-006','PPT 2p','배터리·엔진 오류 통합','배터리 에러를 별도로 배치하지 않고 엔진 오류와 함께 기존 차량 에러에서 조회한다.','상단의 배터리 에러 건수를 차량 에러에 합산하고 별도 항목을 제거했다. 차량 에러 표에 배터리·엔진 오류 표본을 함께 표시했다.','.srvc-tab__item[data-icon="error"]','상단 차량 에러 현황과 기존 차량 에러 표','UI 적용 / 통합 API 필요'),
      callout(7,'R-SVC-007','PPT 2p','배터리에러 메뉴 제거','통합 후 별도의 배터리에러 메뉴를 제거한다.','서비스 좌측 메뉴는 차량 에러·정비 이력·소모품 관리만 남겼다.','.analysis-menu-list .side-item.active','차량 에러가 활성화된 좌측 메뉴','UI 적용 / 구 URL 처리 필요'),
      callout(8,'R-SVC-008','PPT 2p','PDF 조건부 표시','첨부 PDF가 존재하는 건에만 PDF 아이콘을 표시한다.','첨부 여부가 true인 행에만 PDF 아이콘이 렌더링되도록 구성했다.','[data-req-col="attachment"]','오류 표의 첨부 열','UI 적용 / 파일 권한 API 필요'),
      callout(9,'R-SVC-009','PPT 2p','차량·배터리 오류 구분','기존 중요도 열을 차량 오류와 배터리 오류를 구별하는 구분 열로 변경한다.','열 제목을 구분으로 바꾸고 BMS·배터리 오류는 배터리, J1939·CAN 등 그 외 오류는 차량으로 표시했다. 실제 운영에서는 오류 원천 코드의 표준 분류값을 API로 제공해야 한다.','[data-req-col="severity"]','오류 표의 구분 열','UI 적용 / 오류 원천 매핑 API 확인 필요'),
    ],
    'maintenance-history': [
      callout(1,'R-MNT-001','PPT 3p','Claim 번호 추가','정비 이력에 고객과 서비스 건을 식별할 Claim 번호를 표시한다.','Claim 번호 열은 화면에 표시하고 값은 수리 ID 확인 필요로 두었다. 수리 ID가 Claim과 동일한 업무 식별자인지, 유일하고 누락 없이 제공되는지 확인한 뒤 기존 값 매핑 또는 신규 개발 여부를 결정한다.','[data-req-col="claim"]','플릿 정비 이력 표의 Claim 번호 열','UI 배치 / 업무·API 확인 필요 / 불일치 시 난이도 높음'),
      callout(2,'R-MNT-002','PPT 3p','플릿 상세내용 숨김','플릿 고객 화면의 정비 내용은 현상까지만 보여주고 상세내용은 노출하지 않는다.','상세내용 열을 제거하고 고장부위와 현상까지만 표시했다. 시각과 완료 상태 변경은 3번·4번 요건으로 분리했다.','[data-review-id~="R-MNT-002"]','플릿 정비 이력 표의 현상 열','UI 적용 / 필드 권한 API 필요'),
      callout(3,'R-MNT-003','PPT 3p','접수 일시를 정비 일시로 변경','정비 이력의 [접수 일시] 열 제목을 [정비 일시]로 변경하며 날짜는 기존 접수 일시를 기준으로 표시한다.','열 제목은 정비 일시로 변경하고 각 행의 날짜·시간 값은 기존 접수 일시 값을 그대로 유지했다.','[data-review-column="maintenance-at"]','플릿 정비 이력 표의 정비 일시 열','UI 적용 / 필드 의미 확인 필요'),
      callout(4,'R-MNT-004','PPT 3p','완료 일시를 완료 여부로 변경','정비 이력의 [완료 일시]를 [완료 여부]로 변경하고 O/X로 표시한다.','완료 일시 값이 존재하면 O, 없으면 X로 바꾸어 완료 여부 열에 표시했다.','[data-review-column="completed"]','플릿 정비 이력 표의 완료 여부 열','UI 적용 / 완료 판정 기준 확인 필요'),
      callout(5,'R-MNT-005','PPT 3p','수정·삭제 제거','정비 이력 목록에서 수정과 삭제 기능을 제거한다.','목록을 읽기 전용으로 구성하고 행의 수정·삭제 버튼과 빈 셀을 제거했다.','[data-req-area="readonly"]','정비 이력 표 전체','UI 적용 / 변경 API 차단 필요'),
      callout(6,'R-MNT-006','PPT 3p','등록 제거','정비 이력 화면의 수동 등록 기능을 제거한다.','표 상단 등록 버튼을 제거하고 외부 수신 이력 조회 구조만 남겼다.','[data-req-area="readonly"]','정비 이력 표 우측 상단','UI 적용 / 등록 API 차단 필요'),
      callout(7,'R-MNT-007','PPT 3p','서비스 정렬 기준 통일','그룹/고객명→기종→호기 순으로 서비스 목록 정렬을 통일한다.','요청 정렬 순서를 적용할 수 있도록 정렬 기준 열을 유지했다.','[data-review-column="sort-base"]','플릿 정비 이력 표의 그룹 열','UI 적용 / 서버 정렬 필요')
    ],
    'operation-shock': [
      callout(1,'R-OPS-001','PPT 4p','수소배터리 상세 진입','수소배터리를 1차 메뉴에서 제외하고 한 단계 들어간 상세에서 제공한다.','좌측 메뉴에서 수소배터리를 제거하고 수소 차량 상세보기를 펼친 경우에만 수소 시스템 링크를 표시했다.',['.analysis-menu-list','#vehicle-detail-toggle'],'좌측 운행이력 메뉴와 차량 상세보기','UI 적용 / 상세 라우트 필요')
    ],
    'operation-efficiency': [
      callout(1,'R-OPS-002','PPT 5p','월 평균 그래프','월 선택 시 월 평균 그래프로 보여질 수 있도록 한다.','일·주·월 선택값에 맞춰 그래프를 표시하고 월 선택 시 월 평균 운영효율을 상단에 표시한다.','.linq-review-efficiency-chart','상단 기간 선택과 운영효율 그래프','UI 적용 / 평균 산식 확인 필요'),
      callout(2,'R-OPS-003','PPT 5p','실제 작업시간 숫자 표시','% 외에 실제 작업시간을 숫자로 추가하고 일·주·월 선택에 따라 해당 기간의 값을 보여준다.','그래프 상단과 날짜별 행에 실제 작업시간을 숫자로 표시하고 기간 선택에 따라 값을 변경한다.','.linq-review-period-metrics','그래프 상단 기간 요약과 날짜별 실제 작업시간','UI 적용 / 시간 단위 계약 필요'),
      callout(3,'R-OPS-004','PPT 5p','31일 무스크롤','31일까지 보기 위해 가로 스크롤하지 않도록 하며 필요하면 가로축과 세로축을 변경할 수 있다.','날짜를 세로로 나열하고 0~100% 효율을 가로 막대로 배치해 31일까지 가로 스크롤 없이 표시했다. 축 변경은 이 요청의 구현 방식으로 처리했다.','.linq-review-efficiency-list','1~31일 그래프 전체','UI 적용')
    ],
    'engine-efficiency': [
      callout(1,'R-OPS-006','PPT 6p','엔진 → 엔진 연비 명칭 변경','이름을 ‘엔진’에서 ‘엔진 연비’로 변경해 주세요.','기존 경로와 기능은 유지한다. 좌측 메뉴·화면 제목·breadcrumb가 동일한 다국어 키를 사용하도록 하고, 한국어는 ‘엔진 연비’, 영어는 ‘Engine Fuel Efficiency’로 변경한다.',['.analysis-menu-list .side-item.active','.content-head__main'],'좌측 활성 메뉴와 화면 제목','UI 적용 / i18n 리소스 변경 필요'),
      callout(2,'R-OPS-007','PPT 6p','연비 31일 무스크롤','월 연비 31일을 가로스크롤 없이 확인한다.','31개 일별 연비 막대를 본문 폭 안에 배치하고 날짜·L/h 롤오버 툴팁을 적용했다.','.month-chart','일별 엔진 연비 그래프','UI 적용'),
      callout(3,'Q-OPS-001','검토 질문','연비 현황 Y축 눈금 기준 확인','연비 현황 Y축에 2·1·1·0·-1·-1처럼 중복된 정수와 음수 눈금이 나타나는 것이 정상인지 확인한다.','그래프의 값을 임의 수정하지 않고 Y축 최소·최대값, 눈금 간격(step), 소수점 표시·반올림 기준을 확인 질문으로 분리했다.','.month-chart','연비 현황 그래프의 좌측 Y축 눈금','질문 / 데이터·차트 기준 확인 필요'),
      callout(4,'R-OPS-008','추가 요청','빈 연비 데이터 폴백 그래프','연비 데이터가 비어 있어도 그래프의 형태와 값 표시 방식을 확인할 수 있어야 한다.','원본 차트에 0이 아닌 값이 없을 때만 1~31일 축과 16일 4.0L/H 예시값을 표시한다. 실제 데이터가 수신되면 원본 차트를 사용한다.','.linq-review-fuel-fallback','연비 현황 그래프 전체','UI 적용 / 실제 데이터 수신 시 원본 차트 사용')
    ],
    'lithium-battery': [
      callout(1,'R-BAT-001','PPT 7p','운영 배터리 데이터 반영·에러 정보 제거','리튬배터리 상세 화면 하단의 에러 정보 영역을 삭제한다. 에러 정보는 서비스의 차량 에러 화면에 통합하여 별도로 표시하지 않는다.','운영의 FBA34_224030249 조회값과 8월 충·방전 및 온도 범위를 로컬 상세 화면에 반영하고 하단 에러 정보 섹션만 제거했다.','.content-body','리튬배터리 상세 요약·충방전·온도 그래프 및 화면 하단','UI 적용 / 운영 조회값 반영 / 중복 오류 API 호출 제거 필요'),
      callout(2,'R-BAT-002','PPT 7p','충·방전량과 온도 좌우 비교안','배터리 충전·방전량 정보와 온도 정보를 한 화면에서 함께 비교할 수 있는지 검토한다.','충·방전량과 온도는 단위와 값의 범위가 달라 하나의 그래프에 중첩할 경우 표현이 복잡해지고 사용자가 한눈에 비교하기 어렵다. 동일 조회기간을 공유하는 두 그래프를 좌우에 배치하고 날짜 선택과 롤오버를 연동하는 방식을 권장한다.','.linq-review-battery-compare','별도 좌우 그래프 비교안','검토 의견 / 좌우 병렬 비교안 제공')
    ],
    'home-vehicles': [
      callout(1,'R-HOME-001','PPT 8p','미동의 차량 제외','고객 동의가 완료되지 않은 차량은 목록에서 제외한다.','목록을 고객 동의 완료 차량 결과로 명시하고 해당 결과만 렌더링했다.','.content-subtitle','차량 목록 상단 결과 기준','결과 UI 적용 / 서버 필터 필요'),
      callout(2,'R-HOME-002','PPT 9p','End Customer 갱신','재판매 Delivery Report 수신 시 현재 End Customer를 변경한다.','새 소유 이력 UI는 만들지 않는다. SAP 수신 후 기존 홈 화면의 업체·차량 목록이 변경된 End Customer 기준으로 조회되는 결과만 반영한다.','.goods-summary','홈 화면 업체·차량 목록 결과','프론트 추가 UI 없음 / SAP 연동 필요')
    ],
    'supplies-management': [
      callout(1,'R-SUP-001','PPT 10p','수정→리셋','소모품 관리의 수정 버튼을 리셋으로 변경한다.','각 소모품 행의 관리 버튼을 리셋으로 변경했다.','.reset-button','표 우측 첫 리셋 버튼','UI 적용'),
      callout(2,'R-SUP-002','PPT 10p','입력 팝업 제거','리셋 실행 시 별도의 입력 팝업 없이 즉시 처리한다.','리셋 클릭 즉시 버튼 상태와 기준시각을 바꾸고 완료 토스트만 표시한다.','.reset-button','표 우측 첫 리셋 버튼','UI 적용 / 감사이력 필요'),
      callout(3,'R-SUP-003','PPT 10p','리셋 실행 권한','딜러 대표와 본사 서비스 역할만 소모품 리셋을 실행한다.','표본 화면은 딜러 대표로 표시하고, 실제 실행은 딜러 대표·본사 서비스 두 역할의 서버 액션 권한으로 제한해야 한다.','.content-head__dataset','화면 제목 옆 딜러 대표','권한 API 필요'),
      callout(4,'R-SUP-004','PPT 10p','관리 시작 시점 갱신','리셋 시 관리 시작 시점을 현재 시각으로 갱신한다.','리셋을 누르면 해당 행의 관리 시작 시점이 현재 시각으로 변경된다.','[data-reset-base]','관리 시작 시점 첫 행','UI 적용 / 기준값 저장 필요')
    ],
    'dashboard': [
      callout(1,'R-DSH-002','PPT 11p','지도 전체화면 보기','대시보드 지도 위젯을 전체화면으로 볼 수 있는 아이콘을 제공한다.','지도 카드 우측 상단 아이콘을 누르면 지도 위젯만 브라우저 영역에 확대한다. 다시 누르거나 ESC를 누르면 원래 크기로 복귀한다. “테스트그룹 차량인가요?”는 확인 질문이므로 UI 변경 항목으로 만들지 않았다.','.linq-review-fullscreen-button','지도 위젯 우측 상단 전체화면 아이콘','UI 적용 / 표본 차량은 별도 확인')
    ]
  };

  window.LINQ_REQUIREMENT_REVIEW = {
    reviewGuide,
    requirementIssueIds,
    problemCatalog,
    requirementCallouts,
  };
  if (dataOnly) return;

  function svgBattery() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="6" width="15" height="12" rx="2"/><path d="M19 10h2v4h-2M11 8.5 8.5 13H12l-1 3 4-5h-3z"/></svg>';
  }

  function header(active) {
    const items = [
      ['대시보드','dashboard.html'],['차량관리','home-vehicles.html'],['운행이력','operation-efficiency.html'],
      ['서비스','service-errors.html'],['리포트',''],['지도',''],['관리기능','']
    ];
    return `<header class="page-head"><div class="page-head__inner">
      <a class="page-head__logo" href="../" aria-label="Bobcat MACHINE IQ"><img src="../favicon.ico" alt=""><strong>Bobcat</strong><span>MACHINE IQ</span></a>
      <nav class="page-head__nav" aria-label="주 메뉴">${items.map(([name,href])=>`<button type="button" class="${name===active?'active':''}" ${href?`data-href="${href}"`:''}>${name}</button>`).join('')}</nav>
      <div class="page-head__account"><span>세종물류 · 관리자</span><a href="./">화면 목록</a></div>
    </div></header>`;
  }

  function sideMenu(type, active) {
    if (type === 'service') {
      const items = [['차량 에러','service-errors.html'],['정비 이력','maintenance-history.html'],['소모품 관리','supplies-management.html']];
      return side('서비스', items, active);
    }
    if (type === 'analysis') {
      const items = [['요약정보','../prototypes/analysis-summary-option-3.html?service=fleet&companyId=all&section=summary'],['사용시간','#'],['운영효율','operation-efficiency.html'],['충격','operation-shock.html'],['엔진 연비','engine-efficiency.html'],['리튬배터리','lithium-battery.html']];
      return side('운행이력', items, active);
    }
    if (type === 'dashboard') return side('대시보드', [['기본그룹','dashboard.html'],['테스트그룹','#']], active);
    return side('차량관리', [['전체 차량','home-vehicles.html'],['기본그룹','#'],['테스트그룹','#']], active);
  }

  function side(title, items, active) {
    return `<aside class="local-side analysis-side"><div class="local-side__inner"><div class="page-side">
      <div class="page-side__title">${title}</div><div class="page-side__content"><nav class="analysis-menu-list" aria-label="${title} 하위 메뉴">
        ${items.map(([name,href])=>`<a class="side-item type2 ${name===active?'active':''}" href="${href}"><em>${name}</em></a>`).join('')}
      </nav></div></div></div></aside><button class="local-side-func" type="button" aria-label="좌측 메뉴 접기">‹</button>`;
  }

  function periodFilter(defaultPeriod='day', service=false) {
    const labels = [['day','일'],['week','주'],['month','월'],['custom','사용자설정']];
    return `<div><div class="filter-form req-period-filter">
      <div class="period-tabs">${labels.map(([key,label])=>`<button type="button" data-period="${key}" class="${key===defaultPeriod?'active':''}">${label}</button>`).join('')}</div>
      <input class="req-date" ${service?'':'disabled'} value="2026. 08. 17."><span>~</span><input class="req-date" ${service?'':'disabled'} value="2026. 08. 17."><button class="primary-button" type="button">조회</button>
    </div>${service?'<div class="period-help">날짜를 직접 입력하면 사용자설정으로 전환됩니다. 최대 조회기간 31일</div>':''}</div>`;
  }

  function shell({global,title,dataset='',sideType,activeSide,filter='',content}) {
    return `${header(global)}<div class="page-body">${sideMenu(sideType,activeSide)}
      <main class="local-body"><section class="content-path"><span>⌂</span><span>${global}</span><span>${title}</span></section>
        <div class="content-head-wrap"><div class="content-head"><div class="content-head__main"><h3>${title}</h3>${dataset?`<div class="content-head__dataset">- <span>${dataset}</span></div>`:''}</div>${filter}</div></div>
        <div class="content-body">${calloutGuideBar(screen)}${content}</div>
      </main></div>${footer()}<div class="screen-toast" id="screen-toast" hidden></div><aside class="req-callout-drawer" id="req-callout-drawer" hidden></aside>`;
  }

  function calloutGuideBar(key) {
    const count=(requirementCallouts[key]||[]).length;
    if(!count)return '';
    return `<section class="req-callout-guidebar"><div><strong>화면 변경 위치 ${count}건</strong><span>빨간 번호를 누르면 요청·수정 내용과 연결된 문제점·심각도를 확인할 수 있습니다.</span></div><a href="./">전체 요구사항 목록</a></section>`;
  }

  function requirementGuide(key) {
    const items = reviewGuide[key] || [];
    if (!items.length) return '';
    return `<section class="req-change-guide" id="req-change-guide"><div class="req-change-guide__head"><h4>이 화면에 적용한 요구사항</h4><p>PPT 요청과 실제 변경 위치를 같이 확인할 수 있습니다.</p><button type="button" data-guide-toggle>설명 접기</button></div><div class="req-change-guide__table-wrap"><table class="req-change-guide__table"><colgroup><col><col><col><col></colgroup><thead><tr><th>PPT 위치·요구사항</th><th>페이지에서 요청한 내용</th><th>이 화면에 변경해서 구현한 방식</th><th>화면에서 확인할 위치</th></tr></thead><tbody>${items.map(item=>`<tr><td class="req-change-guide__source">${item.ppt}<span>${item.id}</span><span>${item.status}</span></td><td>${item.request}</td><td>${item.implementation}</td><td>${item.location}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  function footer() {
    return '<footer class="page-foot"><strong>Bobcat <span>MACHINE IQ</span></strong><p>이용약관　 위치정보 및 위치기반서비스 이용약관　 개인(위치)정보 처리방침　 오픈소스 고지</p><p>©2024 Bobcat Company. ALL RIGHTS RESERVED.</p></footer>';
  }

  function monthChart(values, type='efficiency', showHours=false, unit='%') {
    const max = type === 'engine' ? 6 : Math.max(...values,1);
    return `<div class="month-chart">${values.map((value,index)=>{
      const height = type === 'engine' ? (value/max)*92 : type === 'shock' ? (value/max)*92 : value;
      const hours = Math.max(0.5, Math.round(value*0.075*10)/10);
      const detail = `${type==='efficiency'?'운영효율':type==='engine'?'엔진 연비':'충격 횟수'} ${value}${unit}${showHours?`|실제 작업시간 ${hours}h`:''}`;
      return `<div class="month-chart__item" tabindex="0" aria-label="${index+1}일 ${detail.replace('|',' ')}" data-chart-title="8월 ${index+1}일" data-chart-detail="${detail}"><div class="month-chart__bar ${type}" style="height:${Math.max(3,height)}%"><span class="month-chart__value">${value}${unit}</span>${showHours?`<span class="month-chart__hours">${hours}h</span>`:''}</div><span class="month-chart__day">${index+1}</span></div>`;
    }).join('')}</div>`;
  }

  function serviceErrors() {
    const rows = [
      ['충북딜러','㈜두산','D30SE-9','FDB12-000345','Active','J1939 DM1','P0196 / 175 / 11','오일 온도/레벨 센서 범위 초과','차량','2026-07-15 14:46','2026-07-15 14:49',true],
      ['충북딜러','세종물류','D70S-9','FDB21-224250294','Not Detected','J1939 DM1','P1102 / 102 / 18','흡기 압력 신호 미검출','차량','2026-08-16 17:02','2026-08-16 17:21',false],
      ['충북딜러','중원건기','B30S-7','FBA32-002415','Resolved','BMS','BMS-021 / - / -','배터리 온도 경고','배터리','2026-08-17 09:12','2026-08-17 09:38',true],
      ['충북딜러','온양지게차','D70S-9','FDB21-224030182','Active','J1939 DM1','P0562 / 168 / 18','시스템 전압 낮음','차량','2026-08-17 10:05','2026-08-17 10:08',false]
    ];
    const body = rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td class="nowrap"><strong>${r[3]}</strong></td><td data-req-state="${r[4]==='Resolved'?'resolved':r[4]==='Not Detected'?'not-detected':'active'}"><span class="status-tag ${r[4]==='Active'?'active':r[4]==='Resolved'?'resolved':'inactive'}">${r[4]}</span></td><td>${r[5]}</td><td class="nowrap">${r[6]}</td><td class="text-left">${r[7]}</td><td>${r[8]}</td><td class="nowrap">${r[9]}</td><td class="nowrap">${r[10]}</td><td>${r[11]?'<a class="pdf-link" href="#" aria-label="PDF 열기">PDF</a>':''}</td></tr>`).join('');
    return shell({global:'서비스',title:'차량 에러',dataset:'통합 오류 목록',sideType:'service',activeSide:'차량 에러',filter:periodFilter('day',true),content:`
      <div class="req-toolbar"><button class="active">전체 원천</button><button>J1939 DM1</button><button>BMS</button><select><option>Active / Not Detected / Resolved</option></select><span class="role-help">마지막 수신 시각 기준 · SPN/FMI 미제공 시 - 표시</span></div>
      <div class="display-table"><table><thead><tr><th>딜러</th><th>그룹/고객명</th><th>기종</th><th>호기</th><th>상태</th><th>오류 원천</th><th data-req-col="standard">코드 / SPN / FMI</th><th>설명</th><th data-req-col="severity">구분</th><th>발생일시</th><th data-req-col="last-seen">마지막 수신/해제</th><th data-req-col="attachment">첨부</th></tr></thead><tbody>${body}</tbody></table></div>`});
  }

  function maintenanceHistory() {
    const rows = [
      ['충북딜러','㈜두산','D30SE-9','FDB12-000345','CLM-260506-0142','2026-05-06','엔진 주변/에어컨 컴프레셔','이음','아이들풀리 조기 마모로 벨트 및 텐션 베어링 교환','O'],
      ['충북딜러','세종물류','B30S-7','FBA32-002415','CLM-260712-0038','2026-07-12','배터리 커넥터','충전 불량','커넥터 접점 점검 및 단자 체결','O'],
      ['충북딜러','중원건기','D70S-9','FDB21-224250294','CLM-260816-0081','2026-08-16','흡기 계통','출력 저하','센서 신호와 흡기 라인 점검 진행','X']
    ];
    return shell({global:'서비스',title:'정비 이력',dataset:'딜러 대표',sideType:'service',activeSide:'정비 이력',filter:periodFilter('day',true),content:`
      <div class="req-toolbar"><button type="button" class="active" data-role-view="dealer">딜러 대표 보기</button><button type="button" data-role-view="customer">고객 보기</button><span class="role-help">정렬: 그룹/고객명 → 기종 → 호기</span></div>
      <div class="display-table" data-req-area="readonly"><table><thead><tr><th>딜러</th><th>그룹/고객명</th><th>기종</th><th>호기</th><th data-req-col="claim">Claim 번호</th><th data-req-col="maintenance-at">정비 일시</th><th>고장부위</th><th>현상</th><th class="dealer-only">상세내용</th><th class="dealer-only" data-req-col="completed">완료 여부</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.slice(0,8).map((v,i)=>`<td class="${i===3||i===4?'nowrap':''} ${i===7?'text-left':''}">${v}</td>`).join('')}<td class="dealer-only text-left">${r[8]}</td><td class="dealer-only"><strong>${r[9]}</strong></td></tr>`).join('')}</tbody></table></div>`});
  }

  function operationShock() {
    return shell({global:'운행이력',title:'충격',dataset:'FHA30-000101',sideType:'analysis',activeSide:'충격',filter:periodFilter('month'),content:`
      <div class="metric-strip"><div><span>기간 충격 횟수</span><strong>38회</strong></div><div><span>위험 충격</span><strong>3회</strong></div><div><span>최대 충격 레벨</span><strong>Level 3</strong></div><div><span>최근 충격</span><strong>08.17 10:42</strong></div></div>
      <div class="chart-panel"><div class="chart-panel__head"><h4>일별 충격 횟수</h4><span>1일~31일 · 가로 스크롤 없음</span></div>${monthChart(shockValues,'shock',false,'회')}</div>
      <div class="vehicle-detail-access" id="vehicle-detail-access"><div class="vehicle-detail-access__head"><div><strong>FHA30-000101</strong> · B30X-7 H2</div><button type="button" id="vehicle-detail-toggle">차량 상세보기</button></div><div class="vehicle-detail-access__body"><span>선택 차량의 수소 시스템 상태와 운행 상세정보를 확인합니다.</span><a href="#">수소 시스템 상세 →</a></div></div>`});
  }

  function operationEfficiency() {
    return shell({global:'운행이력',title:'운영효율',dataset:'FBA32-002415',sideType:'analysis',activeSide:'운영효율',filter:periodFilter('month'),content:`
      <div class="metric-strip"><div><span>월 평균 운영효율</span><strong>76.4%</strong></div><div><span>실제 작업시간</span><strong>143H 33M</strong></div><div><span>대기시간</span><strong>36H 21M</strong></div><div><span>조회일수</span><strong>31일</strong></div></div>
      <div class="chart-panel"><div class="chart-panel__head"><h4>월 운영효율 및 실제 작업시간</h4><span>막대 위: 효율 · 막대 안: 작업시간</span></div>${monthChart(operationRates,'efficiency',true,'%')}<p class="chart-footnote">각 날짜에 마우스를 올리면 운영효율과 실제 작업시간을 함께 확인할 수 있습니다.</p></div>`});
  }

  function engineEfficiency() {
    return shell({global:'운행이력',title:'엔진 연비',dataset:'FDB21-224250294',sideType:'analysis',activeSide:'엔진 연비',filter:periodFilter('month'),content:`
      <div class="metric-strip"><div><span>월 평균 연비</span><strong>4.4L/h</strong></div><div><span>총 연료 사용량</span><strong>218.6L</strong></div><div><span>실제 작업시간</span><strong>49H 46M</strong></div><div><span>조회일수</span><strong>31일</strong></div></div>
      <div class="chart-panel"><div class="chart-panel__head"><h4>일별 엔진 연비</h4><span>1일~31일 · 가로 스크롤 없음</span></div>${monthChart(fuelRates,'engine',false,'L/h')}<p class="chart-footnote">엔진 메뉴와 화면 제목을 ‘엔진 연비’로 통일했습니다.</p></div>`});
  }

  function lithiumBattery() {
    const dual = chargeValues.map((v,i)=>`<div class="dual-chart__group" tabindex="0" aria-label="${i+1}일 충전 ${v}kWh 방전 ${dischargeValues[i]}kWh" data-chart-title="8월 ${i+1}일" data-chart-detail="충전량 ${v}kWh|방전량 ${dischargeValues[i]}kWh"><i class="dual-chart__bar charge" style="height:${v}%"></i><i class="dual-chart__bar discharge" style="height:${dischargeValues[i]}%"></i><span class="dual-chart__day">${i+1}</span></div>`).join('');
    const temp = tempValues.map((v,i)=>`<div class="dual-chart__group" tabindex="0" aria-label="${i+1}일 평균 배터리 온도 ${v}도" data-chart-title="8월 ${i+1}일" data-chart-detail="평균 배터리 온도 ${v}℃"><i class="dual-chart__bar temp" style="height:${v*2.4}%"></i><span class="dual-chart__day">${i+1}</span></div>`).join('');
    return shell({global:'운행이력',title:'리튬배터리',dataset:'FBA32-002415',sideType:'analysis',activeSide:'리튬배터리',filter:periodFilter('month'),content:`
      <div class="battery-scope-note">오류정보는 서비스 &gt; 차량 에러에서 통합 조회합니다.</div><div class="battery-state-grid"><div><span>배터리 온도</span><strong>31℃</strong><small>최근 수신 10:42</small></div><div><span>충전 상태</span><strong>충전 완료</strong><small>SOC 80%</small></div><div><span>배터리 상태</span><strong class="status-tag normal">정상</strong><small>경고 없음</small></div><div><span>통신 상태</span><strong class="status-tag normal">연결됨</strong><small>최근 수신 10:42</small></div></div>
      <div class="chart-two-column"><div class="chart-panel"><div class="chart-panel__head"><h4>충전·방전량</h4><div class="chart-legend"><span><i style="background:#00a875"></i>충전</span><span><i style="background:#315bd5"></i>방전</span></div></div><div class="dual-chart">${dual}</div></div><div class="chart-panel"><div class="chart-panel__head"><h4>배터리 온도</h4><span>일 평균</span></div><div class="dual-chart">${temp}</div></div></div>`});
  }

  function homeVehicles() {
    const vehicles = [
      ['FBA32-002415','B30S-7','중원건기','리튬','2026-08-17 10:42'],
      ['FDB21-224250294','D70S-9','두산지게차 경남중부판매','엔진','2026-08-17 10:38'],
      ['FBA36-225380008','B25SE-7','온양지게차','납축','2026-08-17 10:35'],
      ['FHA30-000101','B30X-7 H2','세종물류중부지점','수소','2026-08-17 10:31']
    ];
    return shell({global:'차량관리',title:'전체 차량',dataset:'고객 동의 완료 차량',sideType:'home',activeSide:'전체 차량',filter:'<div class="filter-form"><input value="차량번호 또는 고객명" aria-label="차량 검색"><button class="primary-button" type="button">조회</button></div>',content:`
      <div class="content-subtitle"><strong>차량 ${vehicles.length}대</strong><span>고객 동의 완료 · 현재 End Customer 기준</span></div><div class="home-vehicle-list">${vehicles.map(v=>`<div class="home-vehicle-row"><strong>${v[0]}</strong><span>${v[1]}</span><span>${v[2]}</span><span>${v[3]}</span><span>${v[4]}</span><button type="button">상세보기</button></div>`).join('')}</div>`});
  }

  function suppliesManagement() {
    const rows = [
      ['중원건기','B30S-7','FBA32-002415','유압오일 필터','500H','482H','18H','2026-07-01 09:00'],
      ['세종물류','D70S-9','FDB21-224250294','엔진오일','250H','238H','12H','2026-07-18 14:20'],
      ['온양지게차','B25SE-7','FBA36-225380008','배터리 전해액','30일','27일','3일','2026-07-21 10:10']
    ];
    return shell({global:'서비스',title:'소모품 관리',dataset:'딜러 대표',sideType:'service',activeSide:'소모품 관리',filter:periodFilter('day',true),content:`
      <div class="content-subtitle"><strong>소모품 관리 현황</strong><span>리셋 시 현재 시점을 관리 시작 시점으로 저장합니다.</span></div>
      <div class="display-table"><table><thead><tr><th>그룹/고객명</th><th>기종</th><th>호기</th><th>소모품</th><th>교환주기</th><th>사용량</th><th>잔여</th><th>관리 시작 시점</th><th>관리</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>`<td ${i===7?'data-reset-base':''}>${v}</td>`).join('')}<td><button class="reset-button" type="button">리셋</button></td></tr>`).join('')}</tbody></table></div>`});
  }

  function dashboard() {
    return shell({global:'대시보드',title:'그룹별 위젯 대시보드',dataset:'기본그룹',sideType:'dashboard',activeSide:'기본그룹',filter:'<div class="dashboard-head-actions"><button class="fullscreen-button" id="fullscreen-button" type="button" aria-label="전체화면 보기">⛶</button></div>',content:`
      <div class="widget-grid"><div class="widget-card"><h4>운영 차량</h4><div class="widget-value">42<small>대</small></div><div class="widget-bars">${miniBars([36,34,40,42],'운영 차량','대')}</div></div>
      <div class="widget-card"><h4>평균 운영효율</h4><div class="widget-value">76.4<small>%</small></div><div class="widget-bars">${miniBars([68.2,72.5,74.1,76.4],'평균 운영효율','%')}</div></div>
      <div class="widget-card"><h4>점검 필요</h4><div class="widget-value">3<small>대</small></div><p>소모품 2 · 차량 에러 1</p></div><div class="widget-card"><h4>미연결 차량</h4><div class="widget-value">2<small>대</small></div><p>최근 수신 기준</p></div>
      <div class="widget-card wide"><h4>일별 작업시간</h4><div class="widget-bars">${miniBars([5.2,6.2,4.8,7.3,8.1,6.8,7.7,8.4,7.2,7.9],'작업시간','h')}</div></div><div class="widget-card wide"><h4>동력 유형별 차량</h4><div class="metric-strip"><div><span>엔진</span><strong>18</strong></div><div><span>리튬</span><strong>15</strong></div><div><span>납축</span><strong>8</strong></div><div><span>수소</span><strong>1</strong></div></div></div></div>`});
  }

  function miniBars(values, label, unit) {
    const max = Math.max(...values, 1);
    return values.map((value,index)=>`<i tabindex="0" aria-label="${index+1}번째 ${label} ${value}${unit}" data-chart-title="${index+1}번째 구간" data-chart-detail="${label} ${value}${unit}" style="height:${Math.max(8,(value/max)*92)}%"></i>`).join('');
  }

  const renderers = {
    'service-errors': serviceErrors,
    'maintenance-history': maintenanceHistory,
    'operation-shock': operationShock,
    'operation-efficiency': operationEfficiency,
    'engine-efficiency': engineEfficiency,
    'lithium-battery': lithiumBattery,
    'home-vehicles': homeVehicles,
    'supplies-management': suppliesManagement,
    'dashboard': dashboard
  };

  app.innerHTML = (renderers[screen] || serviceErrors)();
  bindInteractions();
  bindChartTooltips();

  function bindInteractions() {
    document.querySelectorAll('[data-href]').forEach(button=>button.addEventListener('click',()=>location.href=button.dataset.href));
    document.querySelectorAll('.req-period-filter [data-period]').forEach(button=>button.addEventListener('click',()=>{
      button.closest('.period-tabs').querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));
    }));
    document.querySelectorAll('.req-date').forEach(input=>input.addEventListener('input',()=>{
      const tabs=input.closest('.filter-form').querySelector('.period-tabs');
      tabs.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item.dataset.period==='custom'));
    }));
    document.querySelectorAll('[data-role-view]').forEach(button=>button.addEventListener('click',()=>{
      document.body.classList.toggle('customer-view',button.dataset.roleView==='customer');
      document.querySelectorAll('[data-role-view]').forEach(item=>item.classList.toggle('active',item===button));
      requestAnimationFrame(positionRequirementMarkers);
    }));
    document.querySelector('[data-guide-toggle]')?.addEventListener('click',event=>{
      const guide=document.getElementById('req-change-guide'); if(!guide)return;
      guide.classList.toggle('is-collapsed');
      event.currentTarget.textContent=guide.classList.contains('is-collapsed')?'설명 펼치기':'설명 접기';
    });
    document.getElementById('vehicle-detail-toggle')?.addEventListener('click',()=>document.getElementById('vehicle-detail-access')?.classList.toggle('open'));
    document.querySelectorAll('.reset-button').forEach(button=>button.addEventListener('click',()=>{
      const base=button.closest('tr').querySelector('[data-reset-base]');
      if(base) base.textContent='2026-08-17 11:00';
      button.textContent='리셋 완료'; button.classList.add('done'); showToast('관리 시작 시점이 현재 시각으로 리셋되었습니다.');
    }));
    document.getElementById('fullscreen-button')?.addEventListener('click',()=>{
      app.classList.toggle('dashboard-fullscreen');
      document.getElementById('fullscreen-button').textContent=app.classList.contains('dashboard-fullscreen')?'⛶':'⛶';
      requestAnimationFrame(positionRequirementMarkers);
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape')app.classList.remove('dashboard-fullscreen');});
  }

  function bindChartTooltips() {
    const points = document.querySelectorAll('[data-chart-title]');
    if (!points.length) return;
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip'; tooltip.hidden = true; document.body.appendChild(tooltip);
    const fillTooltip = point => {
      const details=(point.dataset.chartDetail||'').split('|').filter(Boolean);
      tooltip.innerHTML=`<strong>${point.dataset.chartTitle||''}</strong>${details.map(line=>`<span>${line}</span>`).join('')}`;
      tooltip.hidden=false;
    };
    const placeTooltip = (x,y) => {
      const gap=14, width=tooltip.offsetWidth, height=tooltip.offsetHeight;
      const left=Math.min(window.innerWidth-width-10,Math.max(10,x+gap));
      const top=Math.min(window.innerHeight-height-10,Math.max(10,y-height-gap));
      tooltip.style.left=`${left}px`; tooltip.style.top=`${top}px`;
    };
    points.forEach(point=>{
      point.addEventListener('mouseenter',event=>{fillTooltip(point);placeTooltip(event.clientX,event.clientY);});
      point.addEventListener('mousemove',event=>placeTooltip(event.clientX,event.clientY));
      point.addEventListener('mouseleave',()=>tooltip.hidden=true);
      point.addEventListener('focus',()=>{fillTooltip(point);const rect=point.getBoundingClientRect();placeTooltip(rect.left+rect.width/2,rect.top);});
      point.addEventListener('blur',()=>tooltip.hidden=true);
    });
  }

  const requirementMarkerEntries=[];
  let activeRequirementCallout=null;

  function mountRequirementCallouts() {
    const items=requirementCallouts[screen]||[];
    if(!items.length)return;
    const targetUsage=new Map();
    items.forEach(item=>item.targets.forEach(selector=>{
      const target=document.querySelector(selector);
      if(!target)return;
      const offset=targetUsage.get(target)||0;
      targetUsage.set(target,offset+1);
      target.classList.add('req-callout-target');
      const marker=document.createElement('button');
      marker.type='button'; marker.className='req-callout-marker'; marker.textContent=item.number;
      const markerIssues=issuesForRequirement(item.id);
      const markerSeverity=highestIssueSeverity(markerIssues);
      marker.dataset.severity=severityClass(markerSeverity);
      marker.title=markerIssues.length?`${item.id} · 문제점 ${markerIssues.length}건 · 최고 ${markerSeverity}`:`${item.id} · 연결 문제점 없음`;
      marker.setAttribute('aria-label',`${item.number}번 ${item.title} 설명 보기${markerIssues.length?`, 연결 문제점 ${markerIssues.length}건, 최고 심각도 ${markerSeverity}`:''}`);
      marker.addEventListener('click',event=>{event.stopPropagation();openRequirementCallout(item);});
      document.body.appendChild(marker);
      requirementMarkerEntries.push({item,target,marker,offset});
    }));
    positionRequirementMarkers();
    window.addEventListener('resize',positionRequirementMarkers);
    const requested=Number(new URLSearchParams(location.search).get('callout'));
    if(requested){const item=items.find(entry=>entry.number===requested);if(item)openRequirementCallout(item);}
  }

  function positionRequirementMarkers() {
    const occupied=[];
    requirementMarkerEntries.forEach(({target,marker,offset})=>{
      const rect=target.getBoundingClientRect();
      const visible=rect.width>0&&rect.height>0&&getComputedStyle(target).display!=='none';
      marker.hidden=!visible;
      if(!visible)return;
      const top=window.scrollY+Math.max(4,rect.top-10);
      let left=window.scrollX+rect.right-12-(offset*28);
      while(occupied.some(point=>Math.abs(point.top-top)<25&&Math.abs(point.left-left)<25))left-=28;
      occupied.push({top,left});
      marker.style.top=`${top}px`;
      marker.style.left=`${Math.max(2,left)}px`;
    });
  }

  function openRequirementCallout(item) {
    const drawer=document.getElementById('req-callout-drawer'); if(!drawer)return;
    activeRequirementCallout=item;
    requirementMarkerEntries.forEach(entry=>{
      const active=entry.item.number===item.number;
      entry.marker.classList.toggle('active',active);
      entry.target.classList.toggle('is-callout-active',active);
    });
    const statusClass=item.status.includes('정책')||item.status.includes('확정')?'pending':item.status.includes('필요')?'server':'ui';
    const issues=issuesForRequirement(item.id);
    const highestSeverity=highestIssueSeverity(issues);
    const issueCards=issues.map(issue=>`<article class="req-problem-card severity-${severityClass(issue.severity)}"><div class="req-problem-card__head"><strong>${issue.id}</strong><span class="req-severity-badge severity-${severityClass(issue.severity)}">${issue.severity}</span></div><h5>${issue.title}</h5><p>${issue.detail}</p><dl><div><dt>영향</dt><dd>${issue.impact}</dd></div><div><dt>결정 필요</dt><dd>${issue.decision}</dd></div></dl></article>`).join('');
    const commonIssue=problemCatalog['P-022'];
    drawer.innerHTML=`<div class="req-callout-drawer__head"><span class="req-callout-drawer__number">${item.number}</span><div><small>${item.ppt} · ${item.id}</small><h3>${item.title}</h3></div><button type="button" data-callout-close aria-label="안내 닫기">×</button></div><div class="req-callout-drawer__body"><div class="req-callout-status-row"><span class="req-status ${statusClass}">${item.status}</span>${issues.length?`<span class="req-issue-summary severity-${severityClass(highestSeverity)}">연결 문제점 ${issues.length}건 · 최고 심각도 <strong>${highestSeverity}</strong></span>`:'<span class="req-issue-summary">연결 문제점 없음</span>'}</div><section><h4>페이지에서 요청한 내용</h4><p>${item.request}</p></section><section><h4>이 위치를 수정한 방식</h4><p>${item.change}</p></section><section class="req-callout-location"><h4>화면에서 확인할 위치</h4><p>${item.location}</p></section>${issues.length?`<section class="req-linked-problems"><div class="req-linked-problems__title"><h4>엑셀 문제점 리포트 연결</h4><span>요구사항 ${item.id} 기준</span></div>${issueCards}</section>`:''}<details class="req-common-problem"><summary><span>P-022</span> 공통 검증 주의 <b>${commonIssue.severity}</b></summary><p>${commonIssue.detail}</p><dl><div><dt>영향</dt><dd>${commonIssue.impact}</dd></div><div><dt>결정 필요</dt><dd>${commonIssue.decision}</dd></div></dl></details><p class="req-callout-tip">번호가 붙은 실제 요소가 빨간 테두리로 강조되어 있습니다. 문제점 ID는 요구사항 정의서 엑셀의 ‘문제점 리포트’ 시트와 같습니다.</p></div>`;
    drawer.hidden=false;
    drawer.querySelector('[data-callout-close]')?.addEventListener('click',closeRequirementCallout);
  }

  function closeRequirementCallout() {
    const drawer=document.getElementById('req-callout-drawer'); if(drawer)drawer.hidden=true;
    activeRequirementCallout=null;
    requirementMarkerEntries.forEach(entry=>{entry.marker.classList.remove('active');entry.target.classList.remove('is-callout-active');});
  }

  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&activeRequirementCallout)closeRequirementCallout();});
  mountRequirementCallouts();

  function showToast(message) {
    const toast=document.getElementById('screen-toast'); if(!toast)return;
    toast.textContent=message; toast.hidden=false; clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.hidden=true,2200);
  }
})();
