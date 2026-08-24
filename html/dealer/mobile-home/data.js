window.LINQ_DEALER_MOBILE_DATA = {
  sourcePeriod: '2026.08.01 ~ 2026.08.13',
  referenceDate: '2026-08-13',
  captureSources: {
    vehicleMenu: '../dealer-data/da1098ef663ae46832ce2b74cf9e5fc7536634ce0e880e76b1c625393628d025.json',
    vehicleDaily: '../dealer-data/1de823a3e847ecb7b68d436229945fc7fb6272e9a6cdef35101b5c75b2066f4d.json',
    vehicleErrors: '../dealer-data/f2aa3d3a302486b2e8e2267a358b96da753a62853f6b495c2e07dcba7832e071.json',
    batteryErrors: '../dealer-data/3687c83e588c29d52532774a7a4d4b372af71de5c21b13e24ecad150c8a90632.json',
    supplies: '../dealer-data/828cf42c611efda5b672f01f512c3748a4f639664addfcff20d12c70a9eca288.json'
  },
  account: { id: 'Test_Dealer2_Admin', role: '딜러 관리자' },
  counts: {
    totalService: 423,
    vehicleError: 43,
    batteryError: 167,
    suppliesDue: 213,
    maintenance: 2
  },
  vehicles: [
    {equipmentNumber:'FBA34-000637', model:'B35S-7', company:'두산지게차 경남중부판매 주식회사', power:'리튬', connection:'연결됨', status:'attention', issue:'차량 에러 1건'},
    {equipmentNumber:'FBA34_224030249', model:'B35S-7', company:'(주)세종물류중부지점', power:'리튬', connection:'연결됨', status:'attention', issue:'차량 에러 1건'},
    {equipmentNumber:'FBA30_225060326', model:'B20S-7', company:'두산지게차 경남중부판매 주식회사', power:'리튬', connection:'연결됨', status:'attention', issue:'소모품 도래 1건'},
    {equipmentNumber:'FDB12-000345', model:'D30SE-9', company:'(주)두산', power:'엔진', connection:'연결됨', status:'normal', issue:'정상'},
    {equipmentNumber:'FBA32_224250271', model:'B30S-7', company:'(주)세종물류중부지점', power:'리튬', connection:'연결됨', status:'normal', issue:'정상'}
  ],
  service: {
    error: [
      {equipmentNumber:'FBA34-000637', model:'B35S-7', company:'두산지게차 경남중부판매 주식회사', title:'핑거팁 컨트롤러 CAN 통신 이상', detail:'에러코드 51', errorCode:'51', errorKind:'차량 에러', status:'현재', datetime:'2026-08-13 15:43'},
      {equipmentNumber:'FBA34_224030249', model:'B35S-7', company:'(주)세종물류중부지점', title:'핑거팁 컨트롤러 CAN 통신 이상', detail:'에러코드 51', errorCode:'51', errorKind:'차량 에러', status:'현재', datetime:'2026-08-13 13:59'}
    ],
    supply: [
      {equipmentNumber:'FBA30_225060326', model:'B20S-7', company:'두산지게차 경남중부판매 주식회사', title:'트랜스미션 오일', detail:'796H 사용 · 교체 기준 100H', usage:'796H', cycle:'100H', percent:'795.58%', status:'교체 초과', datetime:'2026-08-13', registeredAt:'2025-10-16 01:08'}
    ],
    maintenance: [
      {equipmentNumber:'FDB12-000345', model:'D30SE-9', company:'(주)두산', title:'엔진 주변/에어컨 컴프레서', detail:'아이들풀리 조기 마모 · 벨트 및 컴프레서 점검', status:'완료', datetime:'2026-05-06'},
      {equipmentNumber:'FBA11-004433', model:'15,20T-7', company:'기본그룹', title:'연료 계통 점검', detail:'연료 필터 압력 센서 및 공급 시스템 점검', status:'완료', datetime:'2023-01-15'}
    ]
  },
  priority: [
    {
      type: 'error', status: '현재', equipmentNumber: 'FBA34-000637', model: 'B35S-7',
      company: '두산지게차 경남중부판매 주식회사', code: '51',
      title: '핑거팁 컨트롤러 CAN 통신 이상', datetime: '2026-08-13 15:43'
    },
    {
      type: 'error', status: '현재', equipmentNumber: 'FBA34_224030249', model: 'B35S-7',
      company: '(주)세종물류중부지점', code: '51',
      title: '핑거팁 컨트롤러 CAN 통신 이상', datetime: '2026-08-13 13:59'
    },
    {
      type: 'supply', status: '교체 초과', equipmentNumber: 'FBA30_225060326', model: 'B20S-7',
      company: '두산지게차 경남중부판매 주식회사',
      title: '트랜스미션 오일', usage: '796H / 기준 100H', percent: '795.58%', datetime: '2026-08-13'
    }
  ],
  notifications: [
    { type: 'error', title: 'FBA34-000637 차량 에러', detail: '에러코드 51 · CAN 통신 이상', time: '15:43' },
    { type: 'supply', title: 'FBA30_225060326 소모품 도래', detail: '트랜스미션 오일 교체 기준 초과', time: '08.13' }
  ]
};
