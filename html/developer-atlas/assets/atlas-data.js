window.MIQ_ATLAS = {
  meta: {
    title: 'MACHINE IQ 개발 아틀라스',
    version: '2026.08.26',
    scope: '현재 플릿·딜러 정적 프론트, 캡처 JSON, 요구사항 PPT 2–11p',
    fleetFiles: 891,
    dealerFiles: 1035,
    apiModules: 23,
    customerRequirements: 31
  },
  actors: [
    {id:'ACT-FL',name:'플릿 관리자',scope:'소속 업체·그룹·차량의 운행·서비스 현황 조회',permission:'고객에게 허용된 현상·상태 중심'},
    {id:'ACT-DL',name:'딜러 관리자',scope:'판매·관리 대상 업체와 차량의 문제 확인·조치',permission:'승인된 정비 상세·소모품 조치 포함'},
    {id:'ACT-HQ',name:'본사 서비스',scope:'서비스 정책·권한에 따른 조치와 검증',permission:'소모품 초기화 등 서버 액션 권한 필요'},
    {id:'ACT-IT',name:'운영·개발',scope:'API·권한·상태·데이터 품질 운영',permission:'감사 이력과 연동 상태 확인'}
  ],
  runtimeRoles: [
    {name:'사용자',detail:'메뉴·업체·그룹·차량·기간 선택과 상세·조치 실행'},
    {name:'화면 입력·선택 상태',detail:'현재 화면의 입력값과 활성 메뉴·필터 상태'},
    {name:'프론트 화면·상태 제어',detail:'Pinia·persisted 상태와 라우트 파라미터를 조합해 요청 생성'},
    {name:'API 요청·응답 처리',detail:'화면별 API 모듈이 조회·저장 요청과 응답 DTO 처리'},
    {name:'데이터 응답·저장소',detail:'현재는 캡처 JSON과 local-changes, 향후 개발·운영 API와 DB'}
  ],
  contextVariables: [
    {key:'service',meaning:'플릿·딜러 서비스 구분',source:'진입 URL·로그인 서비스',receive:'라우터/메뉴',rule:'fleet/dealer 허용값만 사용'},
    {key:'locale',meaning:'표시 언어·날짜·숫자 형식',source:'사용자 설정 또는 URL 언어 구간',receive:'i18n 저장소·API',rule:'BCP 47 코드로 표준화 필요'},
    {key:'companyId',meaning:'조회 업체',source:'상단 조회 대상·사용자 권한',receive:'라우트/상태 저장소/API',rule:'서버에서 사용자 접근 업체 재검증'},
    {key:'groupId',meaning:'업체 하위 그룹',source:'업체 선택 후 그룹 선택',receive:'라우트/상태 저장소/API',rule:'companyId 변경 시 종속 값 초기화'},
    {key:'equipmentId',meaning:'조회 차량·기체',source:'차량 선택·목록·상세 이동',receive:'라우트 path/API',rule:'company/group 소속과 접근 권한 재검증'},
    {key:'periodTypeCode',meaning:'일·주·월·사용자설정',source:'기간 버튼·날짜 직접 입력',receive:'화면 상태/API',rule:'날짜 직접 수정 시 custom 전환'},
    {key:'startDate / endDate',meaning:'조회 시작·종료',source:'기간 계산 또는 사용자 입력',receive:'API query',rule:'지역 시간 경계와 서버 허용 범위 확인'},
    {key:'pageNo / pageSize / sortCol',meaning:'목록 페이지·정렬',source:'표·목록 조작',receive:'API query',rule:'서버 허용 정렬 컬럼만 사용'}
  ],
  permissions: [
    {title:'메뉴 진입',current:'TB_MENU·TB_MENU_ROLE·TB_COMPANY_MENU 계열과 프론트 역할 확인',target:'서비스·역할·메뉴 권한을 한 계약으로 정규화'},
    {title:'조회 대상',current:'companyId/groupId/equipmentId를 라우트와 저장 상태에서 전달',target:'토큰의 조직·차량 권한과 요청 ID를 서버에서 교차 검증'},
    {title:'필드 노출',current:'플릿·딜러 화면이 다르지만 화면 숨김에 의존할 위험',target:'플릿/딜러별 응답 DTO에서 허용 필드만 반환'},
    {title:'조치 권한',current:'소모품 초기화·PDF·관리 저장 등 기능별 기준 분산',target:'action permission 코드와 감사 이력을 서버에 적용'}
  ],
  i18n: [
    {title:'공통 UI 문구',current:'공통 텍스트 API와 프론트 i18n 저장소 사용',target:'locale fallback과 번역 키 소유 주체 명확화'},
    {title:'업무 코드 문구',current:'TB_CODE_LANG는 2자리 LANG_CODE, 일부 테이블은 언어별 컬럼',target:'BCP 47 locale 기반 번역 리소스 테이블로 통합'},
    {title:'날짜·시간대',current:'LOCALE_CODE·LANGUAGE·TIMEZONE_ID·고정 UTC_OFFSET 혼재',target:'UTC 저장 + IANA timezone + locale 표시'},
    {title:'숫자·단위',current:'연비·거리·온도 단위가 컬럼 설명·문자열에 혼재',target:'기준 단위 값과 unitCode를 분리하고 지역별 변환'}
  ],
  menu: [
    {name:'대시보드',children:['그룹별 대시보드','그룹별 위젯 대시보드'],note:'지도 위젯과 현황 요약'},
    {name:'차량 관리',children:['차량 정보'],note:'검색·목록·상세·위치'},
    {name:'운행 이력',children:['요약 정보','사용 시간','운영 효율','충격','엔진 연비','리튬 배터리'],note:'조회 대상과 기간 기반 분석'},
    {name:'서비스',children:['전체','정비 이력','소모품 관리','차량 에러'],note:'문제 확인과 조치'},
    {name:'리포트',children:['그룹별 현황','그룹별 비교','그룹별 히트맵'],note:'집계·비교·출력'},
    {name:'지도',children:['지도'],note:'차량 위치·지오펜스'},
    {name:'관리 기능',children:['사용자','업체','그룹','차량','계정 신청 관리'],note:'권한이 있는 관리자만'}
  ],
  screens: [
    {key:'dashboard',ids:['FL-DSH-001','DL-DSH-001'],name:'대시보드',menu:'대시보드',route:'/page/dashboard/widget',module:'api.dashboard-CrDJnEZK.js',api:['/fleet/dashboard/summary','/fleet/dashboard/ranking','/fleet/dashboard/*-widget'],context:['companyId','groupId','startDate','endDate'],data:['보유 현황','가동 시간 순위','업체·그룹 요약','지도 위치'],actions:['기간 조회','위젯 전환','지도 전체 화면'],states:['로딩','정상','빈 데이터','지도 제한'],requirements:['R-DSH-002'],difference:'플릿은 그룹 중심, 딜러는 업체 중심 집계가 기본입니다.',next:'위젯·지도에서 대상 상세로 이동하며 조회 대상을 유지합니다.'},
    {key:'vehicle',ids:['FL-VHC-001','DL-VHC-001'],name:'차량 정보',menu:'차량 관리 > 차량 정보',route:'/page/equip/list/{scope}',module:'api.equip.detail-B7Lf8gG9.js',api:['/fleet/management/search-equipments','/fleet/management/equipment/{equipmentId}','/common/map/geofence/group/equipments'],context:['companyId','groupId','equipmentId','pageNo','pageSize'],data:['차대번호','모델·기종','동력 유형','그룹·업체','연결 상태','누적 거리·가동 시간','위치'],actions:['검색','필터','목록','차량 상세','위치 보기'],states:['로딩','정상','검색 결과 없음','미동의 제외'],requirements:['R-HOME-001','R-HOME-002'],difference:'딜러는 판매·고객 관계를 기준으로 업체를 넘나들며 조회합니다.',next:'차량 상세에서 에러·소모품·운행 정보로 차량 ID를 유지해 이동합니다.'},
    {key:'summary',ids:['FL-OPS-001','DL-OPS-001'],name:'요약 정보',menu:'운행 이력 > 요약 정보',route:'/page/anlz/summary/{scope}',module:'api.analysis.summary-DwJS4XYE.js',api:['/fleet/analysis/summary/{scope}','/fleet/analysis/summary-equipment-{scope}'],context:['companyId','groupId','equipmentId','startDate','endDate','pageNo','pageSize'],data:['운영률','운영효율','충격 횟수','거리','시간','연료·배터리 소비','차량별 요약'],actions:['조회 대상 선택','일·주·월·기간 조회','차량 상세'],states:['로딩','그룹 요약','업체 전체','차량 선택','빈 데이터'],requirements:[],difference:'기본 집계 범위가 플릿 그룹과 딜러 업체로 다릅니다.',next:'선택한 차량·기간을 유지해 사용 시간·운영효율·충격·연비·배터리로 이동합니다.'},
    {key:'calendar',ids:['FL-OPS-002','DL-OPS-002'],name:'사용 시간',menu:'운행 이력 > 사용 시간',route:'/page/anlz/calendar/{scope}',module:'api.analysis.calendar-D7urDzqa.js',api:['/fleet/analysis/calendar/{scope}'],context:['companyId','groupId','equipmentId','periodTypeCode','startDate'],data:['일자','가동 시간','비가동 시간','근무 시간 기준'],actions:['기간 조회','일자 선택','차량 비교'],states:['로딩','정상','휴일','데이터 없음'],requirements:[],difference:'같은 계산을 사용하되 대상 범위와 접근 권한이 다릅니다.',next:'선택 일자·차량을 운영효율 상세 조회에 재사용합니다.'},
    {key:'efficiency',ids:['FL-OPS-003','DL-OPS-003'],name:'운영 효율',menu:'운행 이력 > 운영 효율',route:'/page/anlz/operating/{scope}',module:'api.analysis.operating-alVfq87H.js',api:['/fleet/analysis/operating/summary/{scope}','/fleet/analysis/operating/graph/{scope}','/fleet/analysis/operating/ranking/{scope}'],context:['companyId','groupId','equipmentId','rankType','periodTypeCode','startDate'],data:['작업 시간','대기 시간','미사용 시간','운영효율','작업시간 순위'],actions:['일·주·월 조회','실제 작업시간 확인','순위 이동'],states:['로딩','정상','31일','0값','계산 불가'],requirements:['R-OPS-002','R-OPS-003','R-OPS-004'],difference:'딜러는 업체 집계를 포함하고 플릿은 그룹 집계를 우선합니다.',next:'차량을 선택하면 해당 차량의 기간별 운영 데이터로 좁힙니다.'},
    {key:'shock',ids:['FL-OPS-004','DL-OPS-004'],name:'충격',menu:'운행 이력 > 충격',route:'/page/anlz/shock/{scope}',module:'api.analysis.shock-Dt9mdZ3T.js',api:['/fleet/analysis/shock/graph/{scope}','/fleet/analysis/shock/ranking/{scope}'],context:['companyId','groupId','equipmentId','periodTypeCode','startDate'],data:['일자별 충격값','충격 횟수','차량 순위'],actions:['기간 조회','롤오버 값 확인','차량 선택'],states:['로딩','정상','0회','데이터 없음'],requirements:[],difference:'대상 집계 단위만 다르고 그래프·순위 구조는 공통입니다.',next:'순위의 차량을 선택해 요약 정보 또는 차량 상세로 이동합니다.'},
    {key:'fuel',ids:['FL-OPS-005','DL-OPS-005'],name:'엔진 연비',menu:'운행 이력 > 엔진 연비',route:'/page/anlz/fuel/{scope}',module:'api.analysis.fuel-DJ4mX674.js',api:['/fleet/analysis/fuel/summary/{scope}','/fleet/analysis/fuel/graph/{scope}','/fleet/analysis/fuel/stat/equipment/{equipmentId}'],context:['companyId','groupId','equipmentId','periodTypeCode','startDate'],data:['평균 연비','누적 연료 소비','일자별 연비','금월·전월'],actions:['기간 조회','차량 선택','롤오버 비교'],states:['로딩','정상','0값','데이터 없음'],requirements:['R-OPS-006','R-OPS-007'],difference:'표시 대상은 엔진 차량이며 대상 범위가 플릿/딜러별로 다릅니다.',next:'차량 선택 시 차량별 연비 통계로 이동합니다.'},
    {key:'lithium',ids:['FL-OPS-006','DL-OPS-006'],name:'리튬 배터리',menu:'운행 이력 > 리튬 배터리',route:'/page/anlz/battery/li/{scope}',module:'api.analysis.battery.li-CMcFEU2V.js',api:['/fleet/analysis/li/stat/{scope}','/fleet/analysis/li/graph/charge/{scope}'],context:['companyId','groupId','equipmentId','periodTypeCode','startDate','endDate','pageNo','pageSize'],data:['잔량','예상 수명','작업 가능시간','예상 충전시간','온도','충전 상태','배터리 상태','충·방전량'],actions:['상태 이상 필터','기간 조회','차량 상세','충방전·온도 비교'],states:['로딩','정상','0%','상태 미수신','그래프 데이터 없음'],requirements:['R-BAT-001','R-BAT-002'],difference:'조회 구조는 공통이며 차량·업체 접근 권한만 달라집니다.',next:'차량 행에서 배터리 상세로 이동하고 동일 기간을 사용합니다.'},
    {key:'service-overview',ids:['FL-SVC-001','DL-SVC-001'],name:'서비스 전체',menu:'서비스 > 전체',route:'/page/srvc/summary/{scope}',module:'api.service-NMne5kfF.js',api:['/fleet/service/service-count'],context:['companyId','groupId','equipmentId','periodTypeCode','startDate','endDate'],data:['정비 이력 수','소모품 도래 수','차량 에러 수'],actions:['기간 조회','KPI 선택','세부 메뉴 이동'],states:['로딩','정상','0건','권한 제한'],requirements:['R-SVC-001','R-SVC-002','R-SVC-003','R-SVC-004','R-SVC-005'],difference:'플릿과 딜러가 같은 KPI를 보더라도 세부 화면의 노출 컬럼은 다릅니다.',next:'선택 KPI에 따라 정비 이력·소모품·차량 에러로 이동합니다.'},
    {key:'maintenance',ids:['FL-SVC-002','DL-SVC-002'],name:'정비 이력',menu:'서비스 > 정비 이력',route:'/page/srvc/maintenance/{scope}',module:'api.service-NMne5kfF.js',api:['/fleet/service/services','/fleet/service/ocses'],context:['companyId','groupId','equipmentId','periodTypeCode','startDate','endDate','pageNo','pageSize','sortCol'],data:['그룹·고객','차량','모델','고장부위','현상','상세내용','등록·완료 시각','수리 ID 후보'],actions:['기간 조회','정렬','완료 상태 확인'],states:['로딩','정상','완료/미완료','데이터 없음'],requirements:['R-MNT-001','R-MNT-002','R-MNT-003','R-MNT-004','R-MNT-005','R-MNT-006','R-MNT-007'],difference:'플릿은 현상까지, 딜러는 승인된 상세까지 보여주는 별도 응답 범위가 필요합니다.',next:'차량을 선택해 차량 상세·에러 이력으로 이동합니다.'},
    {key:'supplies',ids:['FL-SVC-003','DL-SVC-003'],name:'소모품 관리',menu:'서비스 > 소모품 관리',route:'/page/srvc/supplies/{scope}',module:'api.service.supplies-C9HG9YYW.js',api:['/fleet/service/schedules','/fleet/service/schedule/{id}'],context:['companyId','groupId','equipmentId','periodTypeCode','startDate','endDate','pageNo','pageSize'],data:['차량','소모품','등록일자','누적시간','교환주기','사용량','관리 시작점'],actions:['기간 조회','교환 완료','초기화','조치 사항 저장'],states:['로딩','정상','교환 도래','완료','권한 없음'],requirements:['R-SUP-001','R-SUP-002','R-SUP-003','R-SUP-004'],difference:'조회는 공통이지만 초기화는 딜러 대표·본사 서비스 서버 권한이 필요합니다.',next:'차량 상세 또는 같은 차량의 소모품 목록으로 돌아갑니다.'},
    {key:'errors',ids:['FL-SVC-004','DL-SVC-004'],name:'차량 에러',menu:'서비스 > 차량 에러',route:'/page/srvc/equipError/{scope}',module:'api.service.equipError-BddjpyHN.js',api:['/fleet/service/errors','/fleet/service/errors/battery','/fleet/service/error/{id}','/fleet/service/error-pdf/{id}'],context:['companyId','groupId','equipmentId','periodTypeCode','startDate','endDate','pageNo','pageSize','sortCol'],data:['현재/과거','차량','에러코드','내용','구분','발생·완료 시각','PDF 존재 여부'],actions:['기간 조회','구분 확인','상세 보기','PDF 다운로드'],states:['로딩','정상','현재/과거','PDF 있음/없음','데이터 없음'],requirements:['R-SVC-006','R-SVC-007','R-SVC-008','R-SVC-009'],difference:'플릿/딜러 각각의 표와 권한을 분리하되 차량·배터리 원천 구분은 보존합니다.',next:'에러 상세에서 목록 복귀 또는 차량 상세로 이동합니다.'},
    {key:'report',ids:['FL-RPT-001','DL-RPT-001'],name:'리포트',menu:'리포트',route:'/page/report/{summary|compare|heatmap}',module:'api.report.summary-CUaJYG7a.js',api:['/fleet/report/summary','/fleet/report/diffgroup','/fleet/report/diffcompnay','/fleet/report/heatmap/graph'],context:['companyId','groupId','companyIds','groupIds','periodTypeCode','startDate'],data:['그룹·업체 요약','비교 지표','히트맵','그래프'],actions:['기간 조회','대상 비교','그래프 확인'],states:['로딩','정상','비교 대상 부족','데이터 없음'],requirements:[],difference:'플릿은 그룹 비교, 딜러는 업체 비교 경로가 추가됩니다.',next:'비교 대상 변경 시 현재 기간을 유지합니다.'},
    {key:'map-admin',ids:['FL-COM-001','DL-COM-001'],name:'지도·관리 기능',menu:'지도 / 관리 기능',route:'/page/{map|admin}',module:'api.mgmt.geofence-Dauvb2Su.js · api.admin.*.js',api:['/common/map/geofence/group/equipments','/fleet/admin/companies','/fleet/admin/groups','/fleet/admin/equipments'],context:['companyId','groupId','equipmentId','searchKeyword','pageNo','pageSize'],data:['위치·지오펜스','사용자','업체','그룹','차량','신청 상태'],actions:['지도 조회','검색','목록 관리','상태 변경'],states:['로딩','정상','지도 제한','권한 없음','저장 실패'],requirements:[],difference:'딜러는 관리 대상 업체 범위가 넓으며 관리 기능은 역할별 제한이 필요합니다.',next:'저장 후 목록을 다시 조회하고 선택 맥락을 유지합니다.'}
  ],
  requirements: [
    ['R-SVC-001','서비스 GNB 활성 밑줄 정렬','공통'],['R-SVC-002','최초 조회 기간을 일로 설정','공통'],['R-SVC-003','사용자설정 가능 기간 안내·범위 확인','결정 질문'],['R-SVC-004','사용자설정 버튼 없이 날짜 직접 입력','공통'],['R-SVC-005','서비스 상단의 전체 집계만 제거','공통'],['R-SVC-006','차량·엔진·배터리 에러 통합','플릿/딜러 분리'],['R-SVC-007','배터리 에러 별도 메뉴 제거','공통'],['R-SVC-008','실제 PDF가 있을 때만 PDF 아이콘','공통'],['R-SVC-009','중요도 대신 차량·배터리 구분','공통'],
    ['R-MNT-001','정비 이력에 Claim 번호 표시','데이터 확인'],['R-MNT-002','플릿 고객은 현상까지만 표시','플릿'],['R-MNT-003','접수 일시를 정비 일시로 명칭 변경','업무 정의'],['R-MNT-004','완료 일시를 완료 여부 O/X로 변경','공통'],['R-MNT-005','수정·삭제 제거','공통'],['R-MNT-006','등록 제거','공통'],['R-MNT-007','플릿/딜러 정렬 기준 분리','플릿/딜러'],
    ['R-OPS-001','수소 배터리를 1차 LNB에서 제외','공통'],['R-OPS-002','선택 기간의 평균 운영효율 표시','공통'],['R-OPS-003','실제 작업시간을 숫자로 표시','공통'],['R-OPS-004','31일을 가로 스크롤 없이 표시','공통'],['R-OPS-006','엔진을 엔진 연비로 명칭 변경','다국어'],['R-OPS-007','연비 그래프 31일 무스크롤','공통'],
    ['R-BAT-001','리튬 상세의 하단 에러 정보 제거','공통'],['R-BAT-002','충방전량과 온도를 좌우 병렬 비교','검토안'],
    ['R-HOME-001','미동의 차량을 목록·검색·카운트에서 제외','서버 필터'],['R-HOME-002','Delivery Report로 End Customer 갱신','외부 연계'],
    ['R-SUP-001','수정을 초기화로 변경','공통'],['R-SUP-002','초기화 입력 팝업 제거','감사 필요'],['R-SUP-003','딜러 대표·본사 서비스만 실행','권한'],['R-SUP-004','초기화 시 관리 시작점 갱신','데이터'],
    ['R-DSH-002','지도 위젯 전체 화면 아이콘','공통']
  ],
  additional: [
    {id:'ADD-OPS-001',title:'연비 데이터가 없을 때 검토용 샘플 그래프',reason:'고객 PPT 원문이 아닌 후속 검토 의견이므로 요구사항과 분리'},
    {id:'Q-OPS-001',title:'연비 현황 Y축 눈금 중복·반올림 확인',reason:'구현 요구가 아니라 데이터·차트 기준 확인 질문'},
    {id:'ADD-MOB-001',title:'딜러 모바일 업무 대시보드·알림·로그인',reason:'고객 PPT 이후 별도 프로토타입 의견'}
  ],
  decisions: [
    {id:'DEC-01',title:'에러 통합의 상태 모델',detail:'BMS와 DM1의 완료·현재/과거 의미를 분리한 sourceType·statusReason 정의',severity:'치명'},
    {id:'DEC-02',title:'Claim과 수리 ID 관계',detail:'동일 식별자면 매핑, 다르면 새 필드·API·연계 개발',severity:'높음'},
    {id:'DEC-03',title:'정비 일시 정의',detail:'등록/접수/작업 시작/완료 중 화면과 정렬이 사용할 기준 확정',severity:'높음'},
    {id:'DEC-04',title:'플릿·딜러 필드 권한',detail:'화면 숨김이 아닌 서버 DTO와 직접 URL 권한 분리',severity:'높음'},
    {id:'DEC-05',title:'운영효율 산식·단위',detail:'월 평균 공식, 작업시간 단위, 근무시간 밖 처리, 최대 100% 확정',severity:'높음'},
    {id:'DEC-06',title:'소모품 초기화 트랜잭션',detail:'관리 시작점, 실행 역할, 중복 방지, 변경 전후·결과 감사 이력',severity:'높음'},
    {id:'DEC-07',title:'사용자설정 조회 가능 범위',detail:'31일로 가정하지 않고 실제 업무 필요 기간, 서버 성능, 데이터량, 타임아웃 기준을 함께 확인',severity:'높음'}
  ]
};
