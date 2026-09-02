(function(){
  'use strict';

  var option=document.body.getAttribute('data-summary-option')||'expand';
  var PERIOD={
    d:{label:'일',range:['2026-07-03','2026-07-03'],f:1/22,eff:1.03},
    w:{label:'주',range:['2026-06-29','2026-07-05'],f:1/4.3,eff:.985},
    m:{label:'월',range:['2026-07-01','2026-07-31'],f:1,eff:1},
    c:{label:'기간',range:['2026-05-01','2026-07-31'],f:3.05,eff:.96}
  };
  var VEHICLES=MIQ.FLEET;
  var TYPES=MIQ.TYPES;
  var DETAIL='../Vehicle%20Detail/vehicle-detail-tobe.html';
  var state={
    period:'m',
    sortKey:option==='sort'?'shock':null,
    sortDir:option==='sort'?-1:1,
    sel:null,
    expanded:{}
  };
  var summaryKpi=document.getElementById('summaryKpi');
  var optionToolbar=document.getElementById('optionToolbar');
  var vehicleList=document.getElementById('vehicleList');
  var live=document.getElementById('optionLive');

  var tree=MIQ.lnbTree(document.getElementById('lnb'),{
    vehicles:VEHICLES,
    onChange:function(sel){state.sel=sel;render()}
  });
  state.sel=tree.get();

  function num(value,decimal){
    var n=Number(value)||0;
    return n.toFixed(decimal===undefined?0:decimal).replace(/\B(?=(\d{3})+(?!\d))/g,',')
  }
  function hm(minutes){
    var total=Math.max(0,Math.round(Number(minutes)||0));
    var hours=Math.floor(total/60);
    var mins=total%60;
    return num(hours)+'H '+(mins<10?'0'+mins:mins)+'M'
  }
  function isBatt(vehicle){return vehicle.type==='리튬'||vehicle.type==='납산'}
  function socColor(value){return value>=60?'#00ad83':value>=30?'#ff9d3b':'#ec2d2d'}
  function periodValue(vehicle){
    var period=PERIOD[state.period];
    var efficiency=isBatt(vehicle)
      ? Math.min(99.5,vehicle.eff*period.eff)
      : vehicle.eff*(2-period.eff);
    return{
      km:vehicle.km*period.f,
      min:vehicle.min*period.f,
      eff:efficiency,
      shock:Math.round(vehicle.shock*period.f),
      fc:vehicle.fc?vehicle.fc*(2-period.eff):null,
      bc:vehicle.bc?vehicle.bc*period.eff:null
    }
  }
  function filtered(){return state.sel&&state.sel.vehicles?state.sel.vehicles:VEHICLES}
  function average(list){return list.length?list.reduce(function(sum,value){return sum+value},0)/list.length:null}
  function selectedVehicle(){return state.sel&&state.sel.vehicle?state.sel.vehicle:null}
  function safeId(value){return String(value).replace(/[^a-zA-Z0-9_-]/g,'-')}
  function escapeAttr(value){
    return String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  }

  function summaryData(rows){
    var result={
      count:rows.length,
      counts:{},
      km:0,
      min:0,
      shock:0,
      efficiency:[],
      fuel:[],
      battery:[]
    };
    TYPES.forEach(function(type){
      result.counts[type]=rows.filter(function(vehicle){return vehicle.type===type}).length
    });
    rows.forEach(function(vehicle){
      var value=periodValue(vehicle);
      result.km+=value.km;
      result.min+=value.min;
      result.shock+=value.shock;
      if(isBatt(vehicle))result.efficiency.push(value.eff);
      if(value.fc!==null)result.fuel.push(value.fc);
      if(value.bc!==null)result.battery.push(value.bc)
    });
    result.efficiencyAvg=average(result.efficiency);
    result.fuelAvg=average(result.fuel);
    result.batteryAvg=average(result.battery);
    return result
  }
  function typesText(data){
    return '엔진 '+data.counts['엔진']+' · 납산 '+data.counts['납산']+' · 리튬 '+data.counts['리튬']+' · 수소 '+data.counts['수소']
  }
  function compactTypesText(data){
    return '엔 '+data.counts['엔진']+' · 납 '+data.counts['납산']+' · 리 '+data.counts['리튬']+' · 수 '+data.counts['수소']
  }
  function valueOrDash(value,suffix,decimal){
    return value===null||value===undefined
      ? '<span class="na">-</span>'
      : num(value,decimal)+suffix
  }

  function renderKpi(rows){
    var data=summaryData(rows);
    summaryKpi.classList.add('is-updating');
    if(option==='expand'){
      var items=[
        {label:'차량 구성',value:'<strong>'+data.count+'대</strong><small title="'+typesText(data)+'">'+compactTypesText(data)+'</small>'},
        {label:'운영효율',value:valueOrDash(data.efficiencyAvg,'%',1)},
        {label:'충격 횟수',value:num(data.shock)+'회',alert:data.shock>0},
        {label:'기간 이동거리',value:num(data.km)+' Km'},
        {label:'기간 가동시간',value:num(data.min/60)+' H'},
        {label:'평균 연료소비',value:valueOrDash(data.fuelAvg,' ℓ/H',1)},
        {label:'평균 배터리소비',value:valueOrDash(data.batteryAvg,' kWh/H',1)}
      ];
      summaryKpi.innerHTML='<div class="kpi-strip-a">'+items.map(function(item){
        return '<div class="kpi-strip-a__item'+(item.alert?' alert':'')+'">'
          +'<span class="kpi-label">'+item.label+'</span>'
          +'<div class="kpi-value">'+item.value+'</div>'
          +'</div>'
      }).join('')+'</div>'
    }else{
      summaryKpi.innerHTML='<div class="kpi-rail-b">'
        +'<div class="kpi-rail-b__group"><span class="kpi-label">조회 범위</span><div class="kpi-rail-b__values"><strong>'+data.count+'대</strong><span title="'+typesText(data)+'">'+compactTypesText(data)+'</span></div></div>'
        +'<div class="kpi-rail-b__group alert"><span class="kpi-label">확인 우선</span><div class="kpi-rail-b__values"><span>충격 <strong>'+num(data.shock)+'회</strong></span></div></div>'
        +'<div class="kpi-rail-b__group"><span class="kpi-label">운영</span><div class="kpi-rail-b__values"><span>효율 <strong>'+valueOrDash(data.efficiencyAvg,'%',1)+'</strong></span></div></div>'
        +'<div class="kpi-rail-b__group"><span class="kpi-label">기간 활동</span><div class="kpi-rail-b__values"><span><strong>'+num(data.km)+'Km</strong></span><span><strong>'+num(data.min/60)+'H</strong></span></div></div>'
        +'<div class="kpi-rail-b__group"><span class="kpi-label">평균 소비</span><div class="kpi-rail-b__values"><span>연료 <strong>'+valueOrDash(data.fuelAvg,'ℓ/H',1)+'</strong></span><span>배터리 <strong>'+valueOrDash(data.batteryAvg,'kWh/H',1)+'</strong></span></div></div>'
        +'</div>'
    }
    requestAnimationFrame(function(){summaryKpi.classList.remove('is-updating')})
  }

  function sortValue(vehicle,key){
    var value=periodValue(vehicle);
    switch(key){
      case'vin':return vehicle.vin;
      case'group':return vehicle.group;
      case'type':return vehicle.type;
      case'cumKm':return vehicle.cumKm;
      case'cumH':return vehicle.cumH;
      case'km':return value.km;
      case'min':return value.min;
      case'performance':return value.eff;
      case'electricEff':return isBatt(vehicle)?value.eff:null;
      case'shock':return value.shock;
      case'conn':return vehicle.conn?1:0;
      case'soc':return vehicle.soc===null?null:vehicle.soc;
      case'fuel':return value.fc;
      case'battery':return value.bc
    }
    return null
  }
  function sortedRows(rows){
    if(!state.sortKey)return rows.slice();
    return rows.slice().sort(function(a,b){
      var left=sortValue(a,state.sortKey);
      var right=sortValue(b,state.sortKey);
      var leftMissing=left===null||left===undefined||Number.isNaN(left);
      var rightMissing=right===null||right===undefined||Number.isNaN(right);
      if(leftMissing&&rightMissing)return a.vin.localeCompare(b.vin,'ko');
      if(leftMissing)return 1;
      if(rightMissing)return-1;
      var result=typeof left==='string'
        ? left.localeCompare(right,'ko')
        : left-right;
      return result===0?a.vin.localeCompare(b.vin,'ko'):result*state.sortDir
    })
  }
  function sortIndicator(key){
    if(state.sortKey!==key)return'↕';
    return state.sortDir===1?'▲':'▼'
  }
  function sortButton(label,key){
    return '<button type="button" class="table-sort'+(state.sortKey===key?' is-sorted':'')+'" data-sort-key="'+key+'" aria-pressed="'+(state.sortKey===key?'true':'false')+'">'
      +label+'<span class="sort-ind">'+sortIndicator(key)+'</span></button>'
  }
  function sortLabel(key){
    var labels={
      vin:'차량번호',group:'그룹',type:'분류',cumKm:'누적 이동거리',cumH:'누적 가동시간',
      km:'기간 이동거리',min:'기간 가동시간',performance:'효율·소비',electricEff:'전동 운영효율',
      shock:'충격 횟수',conn:'TMS 연결',soc:'배터리 SOC',fuel:'엔진 연료소비',battery:'전동 배터리소비'
    };
    return labels[key]||'기본 순서'
  }

  function connectionHtml(vehicle){
    return '<span class="connection-badge '+(vehicle.conn?'on':'off')+'">'+(vehicle.conn?'연결됨':'연결 끊김')+'</span>'
  }
  function socHtml(vehicle){
    if(vehicle.soc===null)return'<span class="na">-</span>';
    return '<span class="soc"><span class="soc__track"><i class="soc__fill" style="width:'+vehicle.soc+'%;--soc-color:'+socColor(vehicle.soc)+'"></i></span><strong>'+vehicle.soc+'%</strong></span>'
  }
  function energyText(vehicle){
    return vehicle.soc===null?'정보 미제공':vehicle.soc+'%'
  }
  function performanceText(vehicle,value){
    return isBatt(vehicle)
      ? {label:'운영효율',value:value.eff.toFixed(1)+'%'}
      : {label:'연료소비',value:value.fc===null?'-':value.fc.toFixed(1)+' ℓ/H'}
  }
  function consumptionText(vehicle,value){
    if(vehicle.type==='엔진')return value.fc===null?'-':value.fc.toFixed(1)+' ℓ/H';
    return value.bc===null?'-':value.bc.toFixed(1)+' kWh/H'
  }
  function health(vehicle,value){
    if(!vehicle.conn)return{cls:'danger',text:'통신 확인'};
    if(vehicle.soc!==null&&vehicle.soc<30)return{cls:'warning',text:'SOC 확인'};
    if(value.shock>=5)return{cls:'warning',text:'충격 확인'};
    return{cls:'normal',text:'정상'}
  }
  function selectVehicle(vin){
    var selected=state.sel&&state.sel.vin===vin;
    tree.set({vin:selected?null:vin})
  }

  function detailPanel(vehicle,value){
    var status=health(vehicle,value);
    var items=[
      ['소속 업체',MIQ.COMPANY],
      ['운영률','정보 미제공'],
      ['충격 횟수',num(value.shock)+'회'],
      ['평균 소비량',consumptionText(vehicle,value)],
      ['TMS Serial','정보 미제공'],
      ['확인 상태','<span class="health-badge '+status.cls+'">'+status.text+'</span>']
    ];
    return '<div class="vehicle-detail-panel">'
      +items.map(function(item){
        return '<div class="vehicle-detail-panel__item"><span>'+item[0]+'</span><strong>'+item[1]+'</strong></div>'
      }).join('')
      +'<p class="vehicle-detail-panel__note">운영률과 TMS Serial은 현재 고객 차량 명부에 원천값이 없어 임의 계산하지 않고 ‘정보 미제공’으로 표시합니다. 기간 기준: '+PERIOD[state.period].label+'</p>'
      +'</div>'
  }

  function renderExpandableTable(rows){
    if(!rows.length){
      vehicleList.innerHTML='<div class="option-empty">조회 조건에 해당하는 차량이 없습니다.</div>';
      return
    }
    var body=rows.map(function(vehicle,index){
      var value=periodValue(vehicle);
      var selected=state.sel&&state.sel.vin===vehicle.vin;
      var expanded=Boolean(state.expanded[vehicle.vin]);
      var detailId='vehicle-detail-'+safeId(vehicle.vin);
      var performance=performanceText(vehicle,value);
      return '<tr class="vehicle-row" data-vin="'+escapeAttr(vehicle.vin)+'" tabindex="0" aria-selected="'+(selected?'true':'false')+'" style="--row-delay:'+(index*16)+'ms">'
        +'<td><div class="vehicle-identity"><button type="button" class="row-expand" data-expand-vin="'+escapeAttr(vehicle.vin)+'" aria-expanded="'+(expanded?'true':'false')+'" aria-controls="'+detailId+'" aria-label="'+escapeAttr(vehicle.vin)+' 상세 '+(expanded?'접기':'펼치기')+'">'+(expanded?'−':'+')+'</button><span class="vehicle-identity__text"><a href="'+DETAIL+'?veh='+encodeURIComponent(vehicle.vin)+'">'+vehicle.vin+'</a><span>'+vehicle.model+'</span></span></div></td>'
        +'<td><span class="affiliation"><strong>'+vehicle.group+'</strong><span>'+vehicle.type+'</span></span></td>'
        +'<td><span class="metric-pair"><span>거리 <strong>'+num(vehicle.cumKm)+' Km</strong></span><span>시간 <strong>'+num(vehicle.cumH)+' H</strong></span></span></td>'
        +'<td><span class="metric-pair"><span>거리 <strong>'+num(value.km,value.km<10?1:0)+' Km</strong></span><span>시간 <strong>'+hm(value.min)+'</strong></span></span></td>'
        +'<td><span class="performance-cell"><span>'+performance.label+'</span><strong>'+performance.value+'</strong></span></td>'
        +'<td class="c">'+connectionHtml(vehicle)+'</td>'
        +'<td class="c">'+socHtml(vehicle)+'</td>'
        +'</tr>'
        +'<tr class="detail-row" data-detail-vin="'+escapeAttr(vehicle.vin)+'" id="'+detailId+'"'+(expanded?'':' hidden')+'><td colspan="7">'+detailPanel(vehicle,value)+'</td></tr>'
    }).join('');
    vehicleList.innerHTML='<div class="expand-table-wrap"><table class="expand-table" aria-label="차량 운행 요약 상세 펼침형">'
      +'<colgroup><col><col><col><col><col><col><col></colgroup>'
      +'<thead><tr>'
      +'<th scope="col">'+sortButton('차량','vin')+'</th>'
      +'<th scope="col">'+sortButton('소속·분류','group')+'</th>'
      +'<th scope="col">'+sortButton('누적','cumKm')+'</th>'
      +'<th scope="col">'+sortButton('선택 기간 '+PERIOD[state.period].label,'km')+'</th>'
      +'<th scope="col">'+sortButton('효율·소비','performance')+'</th>'
      +'<th scope="col" class="c">'+sortButton('TMS','conn')+'</th>'
      +'<th scope="col" class="c">'+sortButton('SOC','soc')+'</th>'
      +'</tr></thead><tbody>'+body+'</tbody></table></div>'
  }

  function fieldClass(keys){
    return keys.indexOf(state.sortKey)>=0?' priority-field is-sort-key':' priority-field'
  }
  function renderPriorityCards(rows){
    if(!rows.length){
      vehicleList.innerHTML='<div class="option-empty">조회 조건에 해당하는 차량이 없습니다.</div>';
      return
    }
    vehicleList.innerHTML='<div class="priority-card-list">'+rows.map(function(vehicle,index){
      var value=periodValue(vehicle);
      var performance=performanceText(vehicle,value);
      var status=health(vehicle,value);
      var selected=state.sel&&state.sel.vin===vehicle.vin;
      return '<article class="priority-card" data-vin="'+escapeAttr(vehicle.vin)+'" tabindex="0" aria-selected="'+(selected?'true':'false')+'" style="--row-delay:'+(index*16)+'ms">'
        +'<div class="priority-card__head">'
        +'<div class="priority-card__identity"><a href="'+DETAIL+'?veh='+encodeURIComponent(vehicle.vin)+'">'+vehicle.vin+'</a><span class="model">'+vehicle.model+'</span><span class="type-badge">'+vehicle.type+'</span></div>'
        +'<div class="priority-card__states"><span class="health-badge '+status.cls+'">'+status.text+'</span>'+connectionHtml(vehicle)+'<span class="priority-card__energy">잔여 에너지 <strong>'+energyText(vehicle)+'</strong></span></div>'
        +'</div>'
        +'<div class="priority-card__info">'
        +'<div class="priority-field"><span>소속 업체</span><strong title="'+escapeAttr(MIQ.COMPANY)+'">'+MIQ.COMPANY+'</strong></div>'
        +'<div class="'+fieldClass(['group'])+'"><span>소속 그룹</span><strong>'+vehicle.group+'</strong></div>'
        +'<div class="'+fieldClass(['type'])+'"><span>동력 유형</span><strong>'+vehicle.type+'</strong></div>'
        +'<div class="'+fieldClass(['cumKm'])+'"><span>누적 이동거리</span><strong>'+num(vehicle.cumKm)+' Km</strong></div>'
        +'<div class="'+fieldClass(['cumH'])+'"><span>누적 가동시간</span><strong>'+num(vehicle.cumH)+' H</strong></div>'
        +'<div class="priority-field"><span>TMS Serial</span><strong class="na">정보 미제공</strong></div>'
        +'</div>'
        +'<div class="priority-card__metrics">'
        +'<div class="priority-field"><span>운영률</span><strong class="na">정보 미제공</strong></div>'
        +'<div class="'+fieldClass(['performance','electricEff'])+'"><span>'+performance.label+'</span><strong>'+performance.value+'</strong></div>'
        +'<div class="'+fieldClass(['shock'])+'"><span>충격 횟수</span><strong>'+num(value.shock)+'회</strong></div>'
        +'<div class="'+fieldClass(['km'])+'"><span>기간 이동거리</span><strong>'+num(value.km,value.km<10?1:0)+' Km</strong></div>'
        +'<div class="'+fieldClass(['min'])+'"><span>기간 가동시간</span><strong>'+hm(value.min)+'</strong></div>'
        +'<div class="'+fieldClass(['fuel','battery'])+'"><span>평균 소비량</span><strong>'+consumptionText(vehicle,value)+'</strong></div>'
        +'</div>'
        +'</article>'
    }).join('')+'</div>'
  }

  function filterChipHtml(){
    var vehicle=selectedVehicle();
    var groupAndType=state.sel?[state.sel.group,state.sel.type].filter(Boolean).join(' · '):'';
    if(!vehicle&&!groupAndType)return'';
    return '<span class="chip-filter">'+(vehicle?vehicle.vin+' · '+vehicle.model:groupAndType)+'<button type="button" id="chipClear" title="선택 해제" aria-label="선택 해제">×</button></span>'
  }
  function clearSelection(){
    var topVehicle=document.querySelector('select[data-target-vehicle]');
    if(topVehicle&&topVehicle.value){
      topVehicle.value='';
      topVehicle.dispatchEvent(new Event('change',{bubbles:true}))
    }else{
      tree.set({group:null,type:null,vin:null})
    }
  }
  function renderToolbar(rows){
    var chip=filterChipHtml();
    if(option==='expand'){
      var allExpanded=rows.length>0&&rows.every(function(vehicle){return Boolean(state.expanded[vehicle.vin])});
      optionToolbar.innerHTML='<span class="option-toolbar__count">차량 <b>'+rows.length+'</b>대</span>'
        +(chip?'<span>'+chip+'</span>':'')
        +'<div class="option-toolbar__tools"><span class="option-toolbar__hint">+ 버튼으로 차량별 추가 정보를 확인합니다.</span><button type="button" class="option-toolbar__button" id="toggleAllDetails">'+(allExpanded?'모두 접기':'모두 펼치기')+'</button></div>';
      document.getElementById('toggleAllDetails').addEventListener('click',function(){
        rows.forEach(function(vehicle){state.expanded[vehicle.vin]=!allExpanded});
        render()
      })
    }else{
      var options=[
        ['vin','차량번호'],['group','그룹'],['type','분류'],['cumKm','누적 이동거리'],['cumH','누적 가동시간'],
        ['km','기간 이동거리'],['min','기간 가동시간'],['electricEff','전동 운영효율'],['shock','충격 횟수'],
        ['conn','TMS 연결'],['soc','배터리 SOC'],['fuel','엔진 연료소비'],['battery','전동 배터리소비']
      ];
      optionToolbar.innerHTML='<span class="option-toolbar__count">차량 <b>'+rows.length+'</b>대</span>'
        +(chip?'<span>'+chip+'</span>':'')
        +'<span class="sort-current">현재 '+sortLabel(state.sortKey)+' · '+(state.sortDir===1?'오름차순':'내림차순')+'</span>'
        +'<div class="option-toolbar__tools">'
        +'<label class="sort-control">정렬 기준 <select class="sort-select" data-role="sort-key" aria-label="정렬 기준">'+options.map(function(item){return'<option value="'+item[0]+'"'+(state.sortKey===item[0]?' selected':'')+'>'+item[1]+'</option>'}).join('')+'</select></label>'
        +'<label class="sort-control">방향 <select class="sort-select" data-role="sort-dir" aria-label="정렬 방향"><option value="1"'+(state.sortDir===1?' selected':'')+'>오름차순</option><option value="-1"'+(state.sortDir===-1?' selected':'')+'>내림차순</option></select></label>'
        +'<button type="button" class="option-toolbar__button" id="sortReset">초기화</button>'
        +'</div>';
      optionToolbar.querySelector('[data-role="sort-key"]').addEventListener('change',function(){
        state.sortKey=this.value;
        state.sortDir=this.value==='shock'?-1:1;
        render()
      });
      optionToolbar.querySelector('[data-role="sort-dir"]').addEventListener('change',function(){
        state.sortDir=Number(this.value);
        render()
      });
      document.getElementById('sortReset').addEventListener('click',function(){
        state.sortKey='shock';
        state.sortDir=-1;
        render()
      })
    }
    var chipClear=document.getElementById('chipClear');
    if(chipClear)chipClear.addEventListener('click',clearSelection)
  }

  function renderChrome(){
    var vehicle=selectedVehicle();
    var label=vehicle
      ? vehicle.vin+' · '+vehicle.model
      : state.sel&&state.sel.label?state.sel.label:'전체';
    document.getElementById('scopeTitle').textContent='- '+label;
    var range=PERIOD[state.period].range;
    var inputs=document.querySelectorAll('#dateRange input');
    if(inputs.length===2){inputs[0].value=range[0];inputs[1].value=range[1]}
  }
  function render(){
    var sourceRows=filtered();
    var ordered=sortedRows(sourceRows);
    renderChrome();
    renderKpi(sourceRows);
    renderToolbar(ordered);
    if(option==='expand')renderExpandableTable(ordered);
    else renderPriorityCards(ordered)
  }

  document.getElementById('periodTabs').addEventListener('click',function(event){
    var button=event.target.closest('button[data-period]');
    if(!button)return;
    Array.prototype.forEach.call(this.querySelectorAll('button'),function(item){item.classList.remove('active')});
    button.classList.add('active');
    state.period=button.getAttribute('data-period');
    render()
  });
  document.getElementById('runSearch').addEventListener('click',function(){
    render();
    live.textContent=PERIOD[state.period].label+' 기준으로 조회했습니다.'
  });
  vehicleList.addEventListener('click',function(event){
    var sort=event.target.closest('[data-sort-key]');
    if(sort){
      var key=sort.getAttribute('data-sort-key');
      if(state.sortKey===key)state.sortDir=-state.sortDir;
      else{state.sortKey=key;state.sortDir=1}
      render();
      return
    }
    var expand=event.target.closest('[data-expand-vin]');
    if(expand){
      var expandVin=expand.getAttribute('data-expand-vin');
      state.expanded[expandVin]=!state.expanded[expandVin];
      render();
      return
    }
    if(event.target.closest('a,button,select,input'))return;
    var selectable=event.target.closest('[data-vin]');
    if(selectable)selectVehicle(selectable.getAttribute('data-vin'))
  });
  vehicleList.addEventListener('keydown',function(event){
    if(event.target.closest('a,button,select,input'))return;
    if(event.key!=='Enter'&&event.key!==' ')return;
    var selectable=event.target.closest('[data-vin]');
    if(!selectable)return;
    event.preventDefault();
    selectVehicle(selectable.getAttribute('data-vin'))
  });
  document.addEventListener('miq:target-change',function(event){
    var vin=event.detail&&event.detail.equipmentId;
    var exists=vin&&VEHICLES.some(function(vehicle){return vehicle.vin===vin});
    if(exists)tree.set({group:null,type:null,vin:vin});
    else if(!vin&&state.sel&&state.sel.vin)tree.set({group:null,type:null,vin:null})
  });

  render()
})();
