/* ══════════════════════════════════════════════════════════════
   Bobcat MachineIQ '26 — 목업 공용 차량 데이터 (_shared/fleet.js)

   LNB(그룹별 · 분류별 · 차량)와 운행이력 > 요약정보가 같은 차량 명부를 쓰도록
   한 곳에 모아둔 데모 데이터. 화면마다 다른 차량이 보이지 않게 하는 것이 목적이다.

     model / vin / group / type / conn : 차량 마스터 + TMS 연결 상태
     cumKm / cumH                     : 누적 이동거리 · 누적 가동시간
     km / min / eff / shock           : 월(m) 기준 운행 지표 (기간 계수는 화면에서 적용)
     soc                              : 리튬만 계측. 엔진 잔여 연료 · 납산 잔여 배터리는
                                        표기 기준 데이터가 없어 null → 화면에서 '-'
     eff                              : 배터리 차량 = 배터리 효율(%), 엔진 = 연비(ℓ/H)
     bc / fc                          : 배터리 소비량(kWh/H) / 연료 소비량(ℓ/H)
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var MIQ = window.MIQ = window.MIQ || {};

  MIQ.COMPANY = '(주)세종물류중부지점';
  MIQ.TYPES = ['엔진', '납산', '리튬', '수소'];

  MIQ.FLEET = [
    { model:'B30S-7', vin:'FBA32_224250271', group:'기본그룹',   type:'리튬', cumKm:12430, cumH:3180, conn:true,  soc:80,   km:16,  min:461,  eff:93.2, shock:2, bc:2.4 },
    { model:'D25S-9', vin:'FBD25_113920044', group:'기본그룹',   type:'엔진', cumKm:28910, cumH:5640, conn:false, soc:null, km:212, min:5772, eff:3.8,  shock:9, fc:3.8 },
    { model:'B18S-7', vin:'FBA18_224250094', group:'테스트그룹', type:'납산', cumKm:9870,  cumH:2410, conn:true,  soc:null, km:15,  min:1000, eff:64.4, shock:1, bc:1.9 },
    { model:'B20S-7', vin:'FBA20_224250312', group:'기본그룹',   type:'리튬', cumKm:7240,  cumH:1860, conn:true,  soc:62,   km:34,  min:1265, eff:88.6, shock:3, bc:2.1 },
    { model:'B25S-7', vin:'FBA25_224250188', group:'기본그룹',   type:'리튬', cumKm:15120, cumH:4020, conn:true,  soc:45,   km:58,  min:2598, eff:91.4, shock:5, bc:2.8 },
    { model:'D30S-9', vin:'FBD30_113920117', group:'테스트그룹', type:'엔진', cumKm:33480, cumH:6210, conn:true,  soc:null, km:187, min:5307, eff:4.1,  shock:7, fc:4.1 },
    { model:'B16S-7', vin:'FBA16_224250045', group:'기본그룹',   type:'리튬', cumKm:4530,  cumH:1120, conn:false, soc:27,   km:12,  min:592,  eff:95.0, shock:0, bc:1.6 },
    { model:'B35S-7', vin:'FBA35_224250403', group:'테스트그룹', type:'리튬', cumKm:19760, cumH:5080, conn:true,  soc:71,   km:76,  min:3693, eff:89.7, shock:4, bc:3.2 },
    { model:'D18S-9', vin:'FBD18_113920062', group:'기본그룹',   type:'엔진', cumKm:21340, cumH:3970, conn:true,  soc:null, km:143, min:3129, eff:3.5,  shock:6, fc:3.5 },
    { model:'B22S-7', vin:'FBA22_224250226', group:'테스트그룹', type:'납산', cumKm:11090, cumH:2880, conn:false, soc:null, km:22,  min:1104, eff:71.2, shock:2, bc:2.0 }
  ];

  MIQ.GROUPS = MIQ.FLEET.map(function (v) { return v.group; })
    .filter(function (g, i, a) { return a.indexOf(g) === i; });
})();
