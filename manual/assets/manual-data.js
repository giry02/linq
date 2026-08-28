(function () {
  const B = (ko, en) => ({ ko, en });

  const glossary = {
    company: { name: B('업체', 'Company'), definition: B('차량을 보유하거나 운영하는 관리 단위입니다. 플릿에서는 로그인한 업체가 기본 범위가 되고, 딜러에서는 여러 업체 중 하나를 선택합니다.', 'An organization that owns or operates vehicles. Fleet uses the signed-in company as its default scope, while Dealer lets you select among multiple companies.') },
    group: { name: B('그룹', 'Group'), definition: B('같은 현장이나 용도로 차량을 묶는 단위입니다. 한 업체 안에서 차량 목록과 통계를 나눠 볼 때 사용합니다.', 'A collection of vehicles grouped by site or purpose. It is used to segment vehicle lists and statistics within a company.') },
    vehicleId: { name: B('차량번호', 'Vehicle ID'), definition: B('차량을 유일하게 구분하는 식별값입니다. 모델명보다 차량번호를 기준으로 검색하거나 상세 화면을 확인하는 것이 정확합니다.', 'A unique identifier for a vehicle. Use the vehicle ID, rather than the model name, for accurate search and detail lookup.') },
    model: { name: B('모델명', 'Model'), definition: B('차량의 제품 모델을 나타냅니다. 같은 모델이라도 차량번호는 서로 다릅니다.', 'The product model of a vehicle. Multiple vehicles may share the same model but have different vehicle IDs.') },
    operationRate: { name: B('운영률', 'Operation Rate'), definition: B('선택한 기간 중 차량이 운전 상태로 기록된 시간의 비율입니다. 기간을 바꾸면 값도 함께 다시 계산됩니다.', 'The percentage of the selected period during which the vehicle was recorded as operating. It is recalculated when the period changes.') },
    operationEfficiency: { name: B('운영효율', 'Operation Efficiency'), definition: B('운전 시간 중 실제 작업으로 집계된 시간의 비율입니다. 운전은 했지만 대기 시간이 길면 운영률과 다르게 보일 수 있습니다.', 'The percentage of operating time counted as productive work. It may differ from operation rate when idle time is high.') },
    operatingHours: { name: B('가동시간', 'Operating Hours'), definition: B('선택한 기간 동안 차량이 가동된 누적 시간입니다. 시간과 분 단위로 표시될 수 있습니다.', 'The accumulated time a vehicle operated during the selected period. It may be displayed in hours and minutes.') },
    distance: { name: B('이동거리', 'Travel Distance'), definition: B('선택한 기간 동안 차량이 이동한 누적 거리입니다.', 'The accumulated distance traveled by a vehicle during the selected period.') },
    impact: { name: B('충격 횟수', 'Impact Count'), definition: B('차량 센서가 기준값 이상의 충격을 감지한 횟수입니다. 횟수를 선택하면 발생 시점과 차량을 확인할 수 있습니다.', 'The number of impacts detected above the configured threshold. Select the count to review the time and vehicle involved.') },
    fault: { name: B('Fault', 'Fault'), definition: B('차량 제어 장치에서 수집된 이상 코드입니다. 코드, 발생 시점, 해제 여부를 함께 확인해야 합니다.', 'An abnormal code collected from the vehicle controller. Review the code, occurrence time, and cleared status together.') },
    soc: { name: B('SOC', 'SOC'), definition: B('배터리의 현재 충전 잔량을 백분율로 나타낸 값입니다.', 'The current battery state of charge, expressed as a percentage.') },
    soh: { name: B('SOH', 'SOH'), definition: B('새 배터리와 비교한 현재 배터리의 건강 상태를 나타내는 값입니다.', 'The current battery health compared with a new battery.') },
    fuel: { name: B('평균연료소비량', 'Average Fuel Consumption'), definition: B('선택 기간의 운전 기록을 기준으로 계산한 평균 연료 사용량입니다.', 'The average fuel usage calculated from operating records in the selected period.') },
    batteryUse: { name: B('평균배터리소비량', 'Average Battery Consumption'), definition: B('선택 기간 동안 사용된 배터리 전력의 평균값입니다.', 'The average battery energy consumed during the selected period.') },
    chargeCount: { name: B('배터리충전횟수', 'Charge Count'), definition: B('선택 기간 동안 충전 이벤트로 집계된 횟수입니다.', 'The number of charging events recorded during the selected period.') },
    engine: { name: B('엔진', 'Engine'), definition: B('디젤 등 연료를 사용하는 엔진 차량 유형입니다. 운행이력에서 연료 소비량과 가동 기록을 확인합니다.', 'A vehicle type powered by a fuel engine such as diesel. Operation history provides fuel consumption and operating records.') },
    lithium: { name: B('리튬배터리', 'Lithium Battery'), definition: B('리튬 이온 배터리를 사용하는 전동 차량 유형입니다. 충전, 방전, 온도와 잔량 정보를 확인합니다.', 'An electric vehicle type using a lithium-ion battery. Review charge, discharge, temperature, and remaining capacity.') },
    leadAcid: { name: B('납축배터리', 'Lead-acid Battery'), definition: B('납산 배터리를 사용하는 전동 차량 유형입니다. 화면에 따라 납축 또는 납산으로 표시될 수 있습니다.', 'An electric vehicle type using a lead-acid battery. The Korean UI may label it as 납축 or 납산.') },
    hydrogen: { name: B('수소배터리', 'Hydrogen Fuel Cell'), definition: B('수소 연료전지를 사용하는 차량 유형입니다. 수소 잔량과 연료전지 상태를 확인합니다.', 'A vehicle type powered by a hydrogen fuel cell. Review hydrogen level and fuel-cell status.') },
    maintenance: { name: B('정비이력', 'Maintenance History'), definition: B('차량의 점검, 수리, 부품 교체 등 정비 작업 기록입니다.', 'A record of inspections, repairs, and parts replacements for a vehicle.') },
    consumable: { name: B('소모품', 'Consumable'), definition: B('사용량이나 기간에 따라 교체가 필요한 오일, 필터 등 관리 항목입니다.', 'A managed item such as oil or a filter that requires replacement based on usage or time.') },
    dueSoon: { name: B('교체임박', 'Due Soon'), definition: B('교체 기준에 가까워져 사전 점검이 필요한 상태입니다.', 'A status indicating that an item is approaching its replacement threshold and should be checked.') },
    replacementDue: { name: B('교체필요', 'Replacement Due'), definition: B('교체 기준을 넘었거나 즉시 조치가 필요한 상태입니다.', 'A status indicating that the replacement threshold has been exceeded or immediate action is needed.') },
    geofence: { name: B('Geofence', 'Geofence'), definition: B('지도 위에 지정한 가상 구역입니다. 차량의 진입이나 이탈을 관리하는 기준으로 사용합니다.', 'A virtual area drawn on the map. It is used to manage vehicle entry and exit events.') },
    tms: { name: B('TMS 단말기', 'TMS Device'), definition: B('차량의 운행 및 상태 데이터를 수집해 전송하는 단말기입니다. 단말기 일련번호로 연결 상태를 확인합니다.', 'A device that collects and transmits vehicle operation and status data. Its serial number is used to verify the connection.') },
    claim: { name: B('Claim', 'Claim'), definition: B('정비 또는 서비스 요청을 접수하고 진행 상태를 관리하는 업무 단위입니다.', 'A work item used to receive and track a maintenance or service request.') },
    heatmap: { name: B('히트맵', 'Heatmap'), definition: B('값의 크기를 색상 농도로 표현한 비교 화면입니다. 진한 색일수록 해당 지표의 값이 상대적으로 큽니다.', 'A comparison view that represents value magnitude using color intensity. Darker color generally means a relatively higher value.') }
  };

  const menuGroups = {
    fleet: [
      { id: 'dashboard', name: B('대시보드', 'Dashboard'), description: B('보유 차량의 전체 현황과 그룹별 핵심 지표를 빠르게 확인합니다. 이상 징후를 발견한 뒤 차량·서비스·운행이력 메뉴로 이동하는 시작 화면입니다.', 'Review overall fleet status and key group metrics at a glance. Use it as the starting point before moving to Vehicles, Service, or Operation History for details.') },
      { id: 'vehicle', name: B('차량관리', 'Vehicle Management'), description: B('로그인한 업체의 그룹과 차량을 조회하고 차량번호, 모델, 연결 상태와 기본 정보를 확인합니다.', 'Browse the signed-in company’s groups and vehicles, including vehicle ID, model, connection status, and basic information.') },
      { id: 'history', name: B('운행이력', 'Operation History'), description: B('기간과 그룹 또는 차량을 선택해 가동시간, 운영률, 효율, 충격, 연료와 배터리 기록을 분석합니다.', 'Analyze operating hours, operation rate, efficiency, impacts, fuel, and battery records by period, group, or vehicle.') },
      { id: 'service', name: B('서비스', 'Service'), description: B('정비, 소모품, 차량 오류와 배터리 오류를 한곳에서 확인하고 필요한 조치 화면으로 이동합니다.', 'Review maintenance, consumables, vehicle faults, and battery faults, then move to the appropriate action screen.') },
      { id: 'report', name: B('리포트', 'Reports'), description: B('그룹별 현황을 기간 기준으로 비교하고 차트와 히트맵으로 차이를 확인합니다.', 'Compare group performance by period using status views, charts, and heatmaps.') },
      { id: 'map', name: B('지도', 'Map'), description: B('차량의 현재 또는 마지막 수집 위치를 지도에서 확인하고 차량 상세로 이동합니다.', 'View each vehicle’s current or last reported location on a map and open vehicle details.') },
      { id: 'admin', name: B('관리기능', 'Administration'), description: B('사용자, 업체, 그룹, 차량, Geofence와 신청 승인 정보를 관리합니다.', 'Manage users, companies, groups, vehicles, geofences, and approval requests.') }
    ],
    dealer: [
      { id: 'dashboard', name: B('대시보드', 'Dashboard'), description: B('딜러가 관리하는 전체 업체와 차량의 핵심 현황을 확인하고 업체별 화면으로 진입합니다.', 'Review key status across all companies and vehicles managed by the dealer, then open company-level views.') },
      { id: 'vehicle', name: B('차량관리', 'Vehicle Management'), description: B('관리 업체를 선택한 뒤 해당 업체의 차량번호, 모델, 연결 상태와 기본 정보를 확인합니다.', 'Select a managed company, then review its vehicle IDs, models, connection status, and basic information.') },
      { id: 'history', name: B('운행이력', 'Operation History'), description: B('업체·기간·차량 범위를 선택해 가동시간, 운영률, 효율, 충격, 연료와 배터리 기록을 분석합니다.', 'Analyze operating hours, operation rate, efficiency, impacts, fuel, and battery records by company, period, and vehicle.') },
      { id: 'service', name: B('서비스', 'Service'), description: B('관리 업체의 정비, 소모품, 차량 오류와 배터리 오류를 조회하고 지원 업무를 진행합니다.', 'Review maintenance, consumables, vehicle faults, and battery faults for managed companies and proceed with support work.') },
      { id: 'report', name: B('리포트', 'Reports'), description: B('업체별 현황을 비교하고 차트와 히트맵으로 차이를 확인합니다.', 'Compare company-level status using charts and heatmaps.') },
      { id: 'map', name: B('지도', 'Map'), description: B('선택한 업체 차량의 현재 또는 마지막 수집 위치를 지도에서 확인합니다.', 'View the current or last reported locations of vehicles for the selected company.') },
      { id: 'admin', name: B('관리기능', 'Administration'), description: B('딜러 권한으로 사용자, 업체, 차량, Geofence와 신청 승인 정보를 관리합니다.', 'Manage users, companies, vehicles, geofences, and approval requests with dealer permissions.') }
    ]
  };

  const calloutSets = {
    dashboard: [
      [49, 5, B('주요 메뉴', 'Primary navigation'), B('대시보드, 차량관리, 운행이력, 서비스, 리포트, 지도, 관리기능으로 이동합니다.', 'Move between Dashboard, Vehicles, Operation History, Service, Reports, Map, and Administration.')],
      [12, 20, B('조회 범위', 'View scope'), B('현재 로그인 범위와 선택된 업체 또는 그룹을 확인합니다.', 'Check the current sign-in scope and selected company or group.')],
      [78, 19, B('기간 및 조회', 'Period and search'), B('일·주·월 또는 날짜 범위를 정한 뒤 조회 버튼으로 지표를 갱신합니다.', 'Choose day, week, month, or a date range, then refresh metrics with Search.')],
      [46, 38, B('핵심 현황', 'Key status'), B('차량 대수, 동력 유형, 가동시간과 운영효율을 요약해서 보여줍니다.', 'Summarizes vehicle count, power type, operating hours, and operation efficiency.')],
      [73, 65, B('상세 위젯', 'Detail widgets'), B('순위, 상태, 그룹 또는 업체별 카드에서 관심 항목을 선택해 상세 화면으로 이동합니다.', 'Select an item in rankings, status widgets, or group/company cards to open details.')]
    ],
    vehicle: [
      [49, 5, B('차량관리 메뉴', 'Vehicle menu'), B('차량정보 화면으로 이동하며 현재 선택 상태가 강조됩니다.', 'Opens Vehicle Information and highlights the current selection.')],
      [11, 25, B('업체·그룹 선택', 'Company and group selection'), B('조회할 업체나 그룹을 선택해 차량 목록의 범위를 정합니다.', 'Select a company or group to set the scope of the vehicle list.')],
      [75, 20, B('차량 검색', 'Vehicle search'), B('차량번호 또는 모델로 목록을 좁혀 원하는 차량을 찾습니다.', 'Filter the list by vehicle ID or model to find a vehicle.')],
      [51, 38, B('차량 목록', 'Vehicle list'), B('차량번호, 모델, 동력 유형, 연결 상태와 주요 값을 행 또는 카드로 확인합니다.', 'Review vehicle ID, model, power type, connection status, and key values in rows or cards.')],
      [83, 63, B('상세 진입', 'Open details'), B('차량을 선택하면 해당 차량의 기본 정보와 연결 가능한 상세 기능을 확인합니다.', 'Select a vehicle to review its basic information and available detail functions.')]
    ],
    trend: [
      [49, 5, B('운행이력 메뉴', 'Operation History menu'), B('요약정보부터 연료·배터리까지 분석 화면을 전환합니다.', 'Switch between Summary and fuel/battery analysis screens.')],
      [11, 25, B('분석 대상 선택', 'Analysis target'), B('업체, 그룹 또는 차량을 선택해 분석 범위를 정합니다.', 'Select a company, group, or vehicle to define the analysis scope.')],
      [77, 19, B('기간 설정', 'Period settings'), B('일·주·월 또는 사용자 지정 날짜로 분석 기간을 바꾸고 조회합니다.', 'Set the analysis period by day, week, month, or custom dates, then run the query.')],
      [48, 34, B('요약 지표', 'Summary metrics'), B('선택한 기간과 대상의 핵심 값을 표 또는 요약 영역에서 먼저 확인합니다.', 'Review key values for the selected period and target in the summary area.')],
      [62, 62, B('상세 데이터', 'Detailed data'), B('차트, 달력, 표 또는 차량 카드에서 시점별 값을 확인합니다. 차트에서는 데이터 지점에 마우스를 올려 상세값을 봅니다.', 'Use charts, calendars, tables, or vehicle cards to inspect values over time. Hover over chart points for exact values.')]
    ],
    service: [
      [49, 5, B('서비스 메뉴', 'Service menu'), B('전체 현황, 정비이력, 소모품, 차량 오류, 배터리 오류 화면을 전환합니다.', 'Switch among Overview, Maintenance, Consumables, Vehicle Faults, and Battery Faults.')],
      [11, 25, B('서비스 대상', 'Service scope'), B('업체, 그룹 또는 차량을 선택해 서비스 데이터 범위를 정합니다.', 'Select a company, group, or vehicle to set the service data scope.')],
      [77, 19, B('조회 조건', 'Search criteria'), B('기간, 상태 또는 키워드를 지정한 뒤 목록을 갱신합니다.', 'Set period, status, or keywords, then refresh the list.')],
      [45, 36, B('상태 요약', 'Status summary'), B('정비 건수, 오류, 교체필요·교체임박 등 우선 확인할 상태를 요약합니다.', 'Summarizes maintenance cases, faults, replacement due, and due-soon statuses.')],
      [61, 63, B('업무 목록', 'Work list'), B('각 행을 선택해 발생 시점, 차량, 진행 상태와 상세 내용을 확인합니다.', 'Select a row to review time, vehicle, progress status, and details.')]
    ],
    report: [
      [49, 5, B('리포트 메뉴', 'Reports menu'), B('현황, 비교, 히트맵 화면을 전환합니다.', 'Switch between Status, Comparison, and Heatmap views.')],
      [13, 25, B('비교 대상', 'Comparison scope'), B('비교할 그룹 또는 업체를 선택합니다.', 'Select the groups or companies to compare.')],
      [78, 19, B('기간 및 지표', 'Period and metric'), B('비교 기간과 운영률, 효율, 가동시간 등 확인할 지표를 선택합니다.', 'Choose the comparison period and metric such as operation rate, efficiency, or operating hours.')],
      [50, 42, B('비교 결과', 'Comparison result'), B('표와 차트에서 대상별 값을 비교합니다.', 'Compare values by target using tables and charts.')],
      [74, 66, B('범례와 상세값', 'Legend and exact values'), B('범례로 대상과 색상을 구분하고 차트 데이터에 마우스를 올려 정확한 값을 확인합니다.', 'Use the legend to identify targets and colors, and hover over chart data for exact values.')]
    ],
    map: [
      [49, 5, B('지도 메뉴', 'Map menu'), B('차량 위치 화면으로 이동합니다.', 'Opens the vehicle location view.')],
      [12, 26, B('위치 조회 범위', 'Location scope'), B('업체, 그룹 또는 차량을 선택해 지도에 표시할 범위를 정합니다.', 'Select a company, group, or vehicle to define what appears on the map.')],
      [28, 20, B('차량 검색', 'Vehicle search'), B('차량번호로 원하는 차량을 빠르게 찾습니다.', 'Find a vehicle quickly by vehicle ID.')],
      [58, 43, B('차량 위치', 'Vehicle locations'), B('지도 마커는 차량의 현재 또는 마지막 수집 위치를 나타냅니다.', 'Map markers show each vehicle’s current or last reported location.')],
      [79, 54, B('위치 상세', 'Location details'), B('마커를 선택해 차량번호, 수집 시각과 상태를 확인하고 차량 상세로 이동합니다.', 'Select a marker to review vehicle ID, timestamp, and status, then open vehicle details.')]
    ],
    admin: [
      [49, 5, B('관리기능 메뉴', 'Administration menu'), B('권한에 따라 사용자, 업체, 그룹, 차량, Geofence와 신청 관리 화면을 전환합니다.', 'Switch among user, company, group, vehicle, geofence, and request management according to permission.')],
      [22, 20, B('검색 및 필터', 'Search and filters'), B('이름, 상태, 기간 등으로 관리 목록을 좁힙니다.', 'Filter the management list by name, status, period, and other criteria.')],
      [78, 19, B('등록·변경', 'Create and edit'), B('새 항목을 등록하거나 선택한 항목의 정보를 변경합니다.', 'Create a new item or edit the selected item.')],
      [51, 40, B('관리 목록', 'Management list'), B('등록 정보, 상태, 연결 관계와 권한을 표에서 확인합니다.', 'Review registration information, status, relationships, and permissions in the table.')],
      [81, 64, B('상세·승인 처리', 'Details and approval'), B('행의 기능 버튼으로 상세 확인, 수정, 승인 또는 반려를 진행합니다.', 'Use row actions to view details, edit, approve, or reject.')]
    ]
  };

  const screen = (group, id, title, screenshot, purpose, kind, terms, liveUrl) => ({ group, id, title, screenshot, purpose, callouts: calloutSets[kind], terms, liveUrl });
  const T = {
    common: ['company', 'group', 'vehicleId'],
    history: ['operationRate', 'operationEfficiency', 'operatingHours', 'distance', 'impact'],
    battery: ['soc', 'soh', 'batteryUse', 'chargeCount'],
    service: ['maintenance', 'consumable', 'replacementDue', 'dueSoon', 'fault']
  };

  const fleetScreens = [
    screen('dashboard','fl-dashboard-group',B('그룹별 대시보드','Dashboard by Group'),'fleet-dashboard-group.png',B('보유 차량과 그룹별 운영 현황을 카드와 순위로 확인합니다. 문제가 보이면 해당 수치나 차량번호를 선택해 상세 화면으로 이동합니다.','Review owned vehicles and group operation status through cards and rankings. Select a value or vehicle ID to open details when attention is needed.'),'dashboard',['group','operationRate','operationEfficiency','operatingHours'],'http://localhost:3000/fleet/ko/page/dashboard/equip'),
    screen('dashboard','fl-dashboard-widget',B('그룹별 위젯 대시보드','Widget Dashboard by Group'),'fleet-dashboard-widget.png',B('필요한 그룹 지표를 위젯 형태로 모아 비교합니다. 위젯의 기간과 대상을 확인한 뒤 상세값을 봅니다.','Compare selected group metrics in widgets. Check each widget’s period and scope before reading details.'),'dashboard',['group','operationRate','operatingHours','impact'],'http://localhost:3000/fleet/ko/page/dashboard/widget'),
    screen('vehicle','fl-vehicle-info',B('차량정보','Vehicle Information'),'fleet-vehicle-info.png',B('업체와 그룹에 등록된 차량을 조회하고 차량번호, 모델, 동력 유형, 단말기와 연결 상태를 확인합니다.','Browse registered vehicles and review vehicle ID, model, power type, device, and connection status.'),'vehicle',['vehicleId','model','tms','engine','lithium','leadAcid','hydrogen'],'http://localhost:3000/fleet/ko/page/equip/list/group/1933/1948'),
    screen('history','fl-history-summary',B('요약정보','Summary'),'fleet-analysis-summary.png',B('선택한 그룹 또는 차량의 운영률, 운영효율, 충격, 거리, 시간과 소비량을 한 화면에서 비교합니다.','Compare operation rate, efficiency, impacts, distance, time, and consumption for the selected group or vehicle.'),'trend',[...T.history,'fuel','batteryUse','chargeCount'],'http://localhost:3000/fleet/ko/page/anlz/summary/group/1933/1948'),
    screen('history','fl-history-time',B('사용시간','Usage Time'),'fleet-analysis-time.png',B('차량별 사용시간을 날짜와 시간대 기준으로 확인해 가동 패턴과 비가동 구간을 파악합니다.','Review usage time by vehicle, date, and time of day to identify operation patterns and inactive periods.'),'trend',['operatingHours','vehicleId'],'http://localhost:3000/fleet/ko/page/anlz/calendar/group/1933/1948'),
    screen('history','fl-history-efficiency',B('운영효율','Operation Efficiency'),'fleet-analysis-efficiency.png',B('선택 기간의 운영률과 운영효율 변화를 비교해 대기 시간이 많은 차량을 찾습니다.','Compare operation rate and efficiency over the selected period to identify vehicles with excessive idle time.'),'trend',['operationRate','operationEfficiency','operatingHours'],'http://localhost:3000/fleet/ko/page/anlz/operate/group/1933/1948'),
    screen('history','fl-history-impact',B('충격','Impact'),'fleet-analysis-shock.png',B('충격 발생 횟수와 시점을 차량별로 확인하고 이상 운행 여부를 점검합니다.','Review impact count and occurrence time by vehicle to investigate abnormal operation.'),'trend',['impact','vehicleId'],'http://localhost:3000/fleet/ko/page/anlz/shock/group/1933/1948'),
    screen('history','fl-history-engine',B('엔진','Engine'),'fleet-analysis-engine.png',B('엔진 차량의 가동시간, 이동거리와 연료 소비 기록을 기간별로 확인합니다.','Review operating hours, travel distance, and fuel consumption for engine vehicles by period.'),'trend',['engine','operatingHours','distance','fuel'],'http://localhost:3000/fleet/ko/page/anlz/fuel/group/1933/1948'),
    screen('history','fl-history-lithium',B('리튬배터리','Lithium Battery'),'fleet-analysis-lithium.png',B('리튬 차량의 충전·방전, 잔량과 배터리 상태 변화를 확인합니다.','Review charge/discharge, remaining capacity, and battery status trends for lithium vehicles.'),'trend',['lithium',...T.battery],'http://localhost:3000/fleet/ko/page/anlz/battery/li/group/1933/1948'),
    screen('history','fl-history-hydrogen',B('수소배터리','Hydrogen Fuel Cell'),'fleet-analysis-hydrogen.png',B('수소 차량의 운행 기록과 수소 잔량 및 연료전지 상태를 확인합니다.','Review operation records, hydrogen level, and fuel-cell status for hydrogen vehicles.'),'trend',['hydrogen','operationRate','operatingHours'],'http://localhost:3000/fleet/ko/page/anlz/battery/hydrogen/group/1933/1948'),
    screen('service','fl-service-all',B('서비스 전체','Service Overview'),'fleet-service-all.png',B('정비, 소모품, 차량 오류와 배터리 오류의 전체 상태를 한곳에서 확인합니다.','Review maintenance, consumables, vehicle faults, and battery faults in one place.'),'service',T.service,'http://localhost:3000/fleet/ko/page/srvc/list/group/1933/1948'),
    screen('service','fl-service-maintenance',B('정비이력','Maintenance History'),'fleet-service-maintenance.png',B('차량별 정비 접수, 작업 내용과 완료 상태를 조회합니다.','Review maintenance requests, work details, and completion status by vehicle.'),'service',['maintenance','claim','vehicleId'],'http://localhost:3000/fleet/ko/page/srvc/maintenance/group/1933/1948'),
    screen('service','fl-service-supplies',B('소모품관리','Consumables'),'fleet-service-supplies.png',B('소모품의 현재 사용 상태와 교체필요·교체임박 항목을 확인합니다.','Review current consumable usage and items marked replacement due or due soon.'),'service',['consumable','replacementDue','dueSoon'],'http://localhost:3000/fleet/ko/page/srvc/supplies/group/1933/1948'),
    screen('service','fl-service-vehicle-error',B('차량에러','Vehicle Faults'),'fleet-service-vehicle-error.png',B('차량에서 발생한 Fault 코드, 발생 시점과 해제 상태를 확인합니다.','Review vehicle fault codes, occurrence time, and cleared status.'),'service',['fault','vehicleId'],'http://localhost:3000/fleet/ko/page/srvc/equipError/group/1933/1948'),
    screen('service','fl-service-battery-error',B('배터리에러','Battery Faults'),'fleet-service-battery-error.png',B('배터리 관련 이상 코드와 발생 차량, 시점 및 상태를 확인합니다.','Review battery-related fault codes, affected vehicles, time, and status.'),'service',['fault','soc','soh','lithium'],'http://localhost:3000/fleet/ko/page/srvc/batteryError/group/1933/1948'),
    screen('report','fl-report-status',B('그룹별현황','Group Status'),'fleet-report-status.png',B('그룹별 차량 수와 핵심 운영 지표를 같은 기간 기준으로 확인합니다.','Review vehicle counts and key operation metrics by group for the same period.'),'report',['group','operationRate','operationEfficiency','operatingHours'],'http://localhost:3000/fleet/ko/page/rpt/area/status'),
    screen('report','fl-report-compare',B('그룹별비교','Group Comparison'),'fleet-report-compare.png',B('여러 그룹의 지표를 차트로 나란히 비교해 차이를 확인합니다.','Compare metrics across groups side by side in charts.'),'report',['group','operationRate','operationEfficiency'],'http://localhost:3000/fleet/ko/page/rpt/area/comparison'),
    screen('report','fl-report-heatmap',B('그룹별히트맵','Group Heatmap'),'fleet-report-heatmap.png',B('그룹과 지표의 상대적 차이를 색상 농도로 확인합니다.','Review relative differences across groups and metrics using color intensity.'),'report',['group','heatmap','operationRate','operatingHours'],'http://localhost:3000/fleet/ko/page/rpt/area/hitmap'),
    screen('map','fl-map',B('지도','Map'),'fleet-map.png',B('그룹 또는 차량을 선택해 지도에서 현재 또는 마지막 수집 위치를 확인합니다.','Select a group or vehicle to view its current or last reported location on the map.'),'map',['geofence','vehicleId','tms'],'http://localhost:3000/fleet/ko/page/maps/roadmap/group/1933/1948'),
    screen('admin','fl-admin-user',B('사용자 관리','User Management'),'fleet-admin-user.png',B('업체 사용자 계정, 역할과 사용 상태를 조회하고 변경합니다.','View and edit company user accounts, roles, and status.'),'admin',['company'],'http://localhost:3000/fleet/ko/page/mgmt/user'),
    screen('admin','fl-admin-company',B('업체 관리','Company Management'),'fleet-admin-company.png',B('업체 기본 정보와 등록 상태를 확인하고 필요한 정보를 변경합니다.','Review company information and registration status, and update details when needed.'),'admin',['company'],'http://localhost:3000/fleet/ko/page/mgmt/company'),
    screen('admin','fl-admin-group',B('그룹 관리','Group Management'),'fleet-admin-group.png',B('업체 안의 차량 그룹을 만들고 그룹명과 소속 차량을 관리합니다.','Create vehicle groups within the company and manage group names and assigned vehicles.'),'admin',['group','vehicleId'],'http://localhost:3000/fleet/ko/page/mgmt/group'),
    screen('admin','fl-admin-geofence',B('Geofence 관리','Geofence Management'),'fleet-admin-geofence.png',B('지도에 가상 구역을 등록하고 구역 이름과 범위를 관리합니다.','Create virtual areas on the map and manage their names and boundaries.'),'admin',['geofence'],'http://localhost:3000/fleet/ko/page/mgmt/geofence/1948'),
    screen('admin','fl-admin-vehicle',B('차량 관리','Vehicle Administration'),'fleet-admin-vehicle.png',B('등록 차량, 단말기 연결과 소속 그룹 정보를 확인하고 수정합니다.','Review and edit registered vehicles, device connections, and group assignments.'),'admin',['vehicleId','model','tms','group'],'http://localhost:3000/fleet/ko/page/mgmt/equip'),
    screen('admin','fl-admin-account-request',B('계정신청관리','Account Requests'),'fleet-admin-account-request.png',B('신규 계정 신청 내용을 확인하고 승인 또는 반려합니다.','Review new account requests and approve or reject them.'),'admin',['company'],'http://localhost:3000/fleet/ko/page/mgmt/request/account'),
    screen('admin','fl-admin-vehicle-request',B('차량신청관리','Vehicle Requests'),'fleet-admin-vehicle-request.png',B('차량 등록 또는 연결 신청 내용을 확인하고 처리 상태를 관리합니다.','Review vehicle registration or connection requests and manage their status.'),'admin',['vehicleId','tms','company'],'http://localhost:3000/fleet/ko/page/mgmt/request/equip')
  ];

  const dealerScreens = [
    screen('dashboard','dl-dashboard-main',B('딜러 대시보드','Dealer Dashboard'),'dealer-dashboard-main.png',B('딜러가 관리하는 전체 업체, 차량과 서비스 현황을 한 화면에서 확인합니다.','Review all managed companies, vehicles, and service status in one dashboard.'),'dashboard',['company','vehicleId','maintenance','fault'],'http://localhost:3001/dealer/ko/page/mgmt/dashboard/company/151'),
    screen('dashboard','dl-dashboard-company',B('업체별 대시보드','Dashboard by Company'),'dealer-dashboard-company.png',B('선택한 업체의 차량 보유와 운영 현황을 확인합니다.','Review vehicle ownership and operation status for the selected company.'),'dashboard',['company','operationRate','operationEfficiency','operatingHours'],'http://localhost:3001/dealer/ko/page/dashboard/company'),
    screen('dashboard','dl-dashboard-widget',B('업체별 위젯 대시보드','Widget Dashboard by Company'),'dealer-dashboard-widget.png',B('여러 업체의 핵심 지표를 위젯으로 구성해 비교합니다.','Compare key metrics across companies using widgets.'),'dashboard',['company','operationRate','operatingHours','impact'],'http://localhost:3001/dealer/ko/page/dashboard/widget-company'),
    screen('vehicle','dl-vehicle-info',B('차량정보','Vehicle Information'),'dealer-vehicle-info.png',B('업체를 선택한 뒤 해당 업체의 차량번호, 모델, 동력 유형, 단말기와 연결 상태를 확인합니다.','Select a company, then review its vehicle IDs, models, power types, devices, and connection status.'),'vehicle',['company','vehicleId','model','tms','engine','lithium','leadAcid','hydrogen'],'http://localhost:3001/dealer/ko/page/equip/list/company/151'),
    screen('history','dl-history-summary',B('요약정보','Summary'),'dealer-analysis-summary.png',B('선택한 업체 또는 차량의 핵심 운행 지표를 한 화면에서 비교합니다.','Compare key operation metrics for the selected company or vehicle in one view.'),'trend',[...T.history,'fuel','batteryUse','chargeCount'],'http://localhost:3001/dealer/ko/page/anlz/summary/company/151'),
    screen('history','dl-history-time',B('사용시간','Usage Time'),'dealer-analysis-time.png',B('업체 차량별 사용시간을 날짜와 시간대 기준으로 확인합니다.','Review usage time for each company vehicle by date and time of day.'),'trend',['company','vehicleId','operatingHours'],'http://localhost:3001/dealer/ko/page/anlz/calendar/company/151'),
    screen('history','dl-history-efficiency',B('운영효율','Operation Efficiency'),'dealer-analysis-efficiency.png',B('업체 차량의 운영률과 운영효율 변화를 비교합니다.','Compare operation rate and efficiency trends for company vehicles.'),'trend',['company','operationRate','operationEfficiency','operatingHours'],'http://localhost:3001/dealer/ko/page/anlz/operate/company/151'),
    screen('history','dl-history-impact',B('충격','Impact'),'dealer-analysis-shock.png',B('충격 발생 횟수와 시점을 업체 및 차량별로 확인합니다.','Review impact count and occurrence time by company and vehicle.'),'trend',['company','impact','vehicleId'],'http://localhost:3001/dealer/ko/page/anlz/shock/company/151'),
    screen('history','dl-history-engine',B('엔진','Engine'),'dealer-analysis-engine.png',B('엔진 차량의 가동시간, 거리와 연료 소비 기록을 업체별로 확인합니다.','Review operating hours, distance, and fuel consumption for engine vehicles by company.'),'trend',['company','engine','operatingHours','distance','fuel'],'http://localhost:3001/dealer/ko/page/anlz/fuel/company/151'),
    screen('history','dl-history-lithium',B('리튬배터리','Lithium Battery'),'dealer-analysis-lithium.png',B('리튬 차량의 충전·방전, 잔량과 배터리 상태를 확인합니다.','Review charge/discharge, remaining capacity, and battery status for lithium vehicles.'),'trend',['company','lithium',...T.battery],'http://localhost:3001/dealer/ko/page/anlz/battery/li/company/151'),
    screen('history','dl-history-hydrogen',B('수소배터리','Hydrogen Fuel Cell'),'dealer-analysis-hydrogen.png',B('수소 차량의 운행 기록과 수소 잔량 및 연료전지 상태를 확인합니다.','Review operation records, hydrogen level, and fuel-cell status for hydrogen vehicles.'),'trend',['company','hydrogen','operationRate','operatingHours'],'http://localhost:3001/dealer/ko/page/anlz/battery/hydrogen/company/151'),
    screen('service','dl-service-all',B('서비스 전체','Service Overview'),'dealer-service-all.png',B('선택한 업체의 정비, 소모품, 차량 오류와 배터리 오류를 한곳에서 확인합니다.','Review maintenance, consumables, vehicle faults, and battery faults for the selected company in one place.'),'service',['company',...T.service],'http://localhost:3001/dealer/ko/page/srvc/list/company/151'),
    screen('service','dl-service-maintenance',B('정비이력','Maintenance History'),'dealer-service-maintenance.png',B('업체와 차량별 정비 접수, 작업 내용과 완료 상태를 조회합니다.','Review maintenance requests, work details, and completion status by company and vehicle.'),'service',['company','maintenance','claim','vehicleId'],'http://localhost:3001/dealer/ko/page/srvc/maintenance/company/151'),
    screen('service','dl-service-supplies',B('소모품관리','Consumables'),'dealer-service-supplies.png',B('업체 차량의 소모품 사용 상태와 교체 우선순위를 확인합니다.','Review consumable status and replacement priority for company vehicles.'),'service',['company','consumable','replacementDue','dueSoon'],'http://localhost:3001/dealer/ko/page/srvc/supplies/company/151'),
    screen('service','dl-service-vehicle-error',B('차량에러','Vehicle Faults'),'dealer-service-vehicle-error.png',B('업체 차량에서 발생한 Fault 코드, 시점과 해제 상태를 확인합니다.','Review fault codes, occurrence time, and cleared status for company vehicles.'),'service',['company','fault','vehicleId'],'http://localhost:3001/dealer/ko/page/srvc/equipError/company/151'),
    screen('service','dl-service-battery-error',B('배터리에러','Battery Faults'),'dealer-service-battery-error.png',B('업체 차량의 배터리 이상 코드와 발생 시점 및 상태를 확인합니다.','Review battery fault codes, occurrence time, and status for company vehicles.'),'service',['company','fault','soc','soh','lithium'],'http://localhost:3001/dealer/ko/page/srvc/batteryError/company/151'),
    screen('report','dl-report-status',B('업체별현황','Company Status'),'dealer-report-status.png',B('업체별 차량 수와 핵심 운영 지표를 같은 기간 기준으로 확인합니다.','Review vehicle counts and key operation metrics by company for the same period.'),'report',['company','operationRate','operationEfficiency','operatingHours'],'http://localhost:3001/dealer/ko/page/rpt/company/status'),
    screen('report','dl-report-compare',B('업체별비교','Company Comparison'),'dealer-report-compare.png',B('여러 업체의 지표를 차트로 나란히 비교합니다.','Compare metrics across multiple companies side by side in charts.'),'report',['company','operationRate','operationEfficiency'],'http://localhost:3001/dealer/ko/page/rpt/company/comparison'),
    screen('report','dl-report-heatmap',B('업체별히트맵','Company Heatmap'),'dealer-report-heatmap.png',B('업체와 지표의 상대적 차이를 색상 농도로 확인합니다.','Review relative differences across companies and metrics using color intensity.'),'report',['company','heatmap','operationRate','operatingHours'],'http://localhost:3001/dealer/ko/page/rpt/company/hitmap'),
    screen('map','dl-map',B('지도','Map'),'dealer-map.png',B('업체 또는 차량을 선택해 지도에서 현재 또는 마지막 수집 위치를 확인합니다.','Select a company or vehicle to view its current or last reported location on the map.'),'map',['company','geofence','vehicleId','tms'],'http://localhost:3001/dealer/ko/page/maps/roadmap/company/151'),
    screen('admin','dl-admin-user',B('사용자 관리','User Management'),'dealer-admin-user.png',B('관리 업체 사용자 계정, 역할과 사용 상태를 조회하고 변경합니다.','View and edit user accounts, roles, and status for managed companies.'),'admin',['company'],'http://localhost:3001/dealer/ko/page/mgmt/user'),
    screen('admin','dl-admin-company',B('업체 관리','Company Management'),'dealer-admin-company.png',B('딜러가 관리하는 업체 정보와 등록 상태를 확인하고 변경합니다.','Review and edit information and registration status for companies managed by the dealer.'),'admin',['company'],'http://localhost:3001/dealer/ko/page/mgmt/company'),
    screen('admin','dl-admin-geofence',B('Geofence 관리','Geofence Management'),'dealer-admin-geofence.png',B('업체별 가상 구역을 등록하고 범위와 연결 정보를 관리합니다.','Create virtual areas by company and manage boundaries and assignments.'),'admin',['company','geofence'],'http://localhost:3001/dealer/ko/page/mgmt/geofence'),
    screen('admin','dl-admin-vehicle',B('차량 관리','Vehicle Administration'),'dealer-admin-vehicle.png',B('업체별 등록 차량, 단말기 연결과 기본 정보를 확인하고 수정합니다.','Review and edit registered vehicles, device connections, and basic information by company.'),'admin',['company','vehicleId','model','tms'],'http://localhost:3001/dealer/ko/page/mgmt/equip'),
    screen('admin','dl-admin-account-request',B('계정신청관리','Account Requests'),'dealer-admin-account-request.png',B('업체의 신규 계정 신청을 확인하고 승인 또는 반려합니다.','Review new account requests from companies and approve or reject them.'),'admin',['company'],'http://localhost:3001/dealer/ko/page/mgmt/request/account'),
    screen('admin','dl-admin-vehicle-request',B('차량신청관리','Vehicle Requests'),'dealer-admin-vehicle-request.png',B('업체의 차량 등록 또는 연결 신청을 확인하고 처리합니다.','Review and process vehicle registration or connection requests from companies.'),'admin',['company','vehicleId','tms'],'http://localhost:3001/dealer/ko/page/mgmt/request/equip')
  ];

  window.MACHINEIQ_MANUAL = {
    glossary,
    menuGroups,
    screens: { fleet: fleetScreens, dealer: dealerScreens },
    serviceName: { fleet: B('플릿', 'Fleet'), dealer: B('딜러', 'Dealer') }
  };
})();
