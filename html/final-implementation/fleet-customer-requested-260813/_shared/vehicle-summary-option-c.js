(function(){
  'use strict';

  var PERIOD={
    d:{label:'일',range:['2026-07-03','2026-07-03'],factor:1/22,eff:1.03},
    w:{label:'주',range:['2026-06-29','2026-07-05'],factor:1/4.3,eff:.985},
    m:{label:'월',range:['2026-07-01','2026-07-31'],factor:1,eff:1},
    c:{label:'설정 기간',range:['2026-05-01','2026-07-31'],factor:3.05,eff:.96}
  };
  var VEHICLES=MIQ.FLEET;
  var TYPES=MIQ.TYPES;
  var DETAIL='../Vehicle%20Detail/vehicle-detail-tobe.html';
  var SORT_OPTIONS=[
    ['vin','차량번호'],['group','소속 그룹'],['type','동력 유형'],['cumKm','누적 이동거리'],['cumH','누적 가동시간'],
    ['electricEff','운영효율'],['shock','충격 횟수'],['km','기간 이동거리'],['min','기간 가동시간'],
    ['conn','TMS 연결'],['soc','잔여 에너지'],['fuel','평균 연료소비'],['battery','평균 배터리소비']
  ];
  var state={period:'m',sortKey:'vin',sortDir:1,sel:null};
  var summaryTable=document.getElementById('summaryTable');
  var toolbar=document.getElementById('referenceToolbar');
  var cards=document.getElementById('referenceCards');
  var live=document.getElementById('referenceLive');
  var tree=MIQ.lnbTree(document.getElementById('lnb'),{
    vehicles:VEHICLES,
    onChange:function(selection){state.sel=selection;render()}
  });
  state.sel=tree.get();

  function num(value,decimal){
    var number=Number(value)||0;
    return number.toFixed(decimal===undefined?0:decimal).replace(/\B(?=(\d{3})+(?!\d))/g,',')
  }
  function hm(minutes){
    var total=Math.max(0,Math.round(Number(minutes)||0));
    var hours=Math.floor(total/60);
    var mins=total%60;
    return num(hours)+'H '+(mins<10?'0'+mins:mins)+'M'
  }
  function isBattery(vehicle){return vehicle.type==='리튬'||vehicle.type==='납산'}
  function filtered(){return state.sel&&state.sel.vehicles?state.sel.vehicles:VEHICLES}
  function selectedVehicle(){return state.sel&&state.sel.vehicle?state.sel.vehicle:null}
  function average(values){return values.length?values.reduce(function(sum,value){return sum+value},0)/values.length:null}
  function escapeAttribute(value){return String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function valueOrUnavailable(value,suffix,decimal){
    return value===null||value===undefined
      ? '<span class="na">정보 미제공</span>'
      : num(value,decimal)+suffix
  }
  function periodValue(vehicle){
    var period=PERIOD[state.period];
    return{
      km:vehicle.km*period.factor,
      min:vehicle.min*period.factor,
      efficiency:isBattery(vehicle)?Math.min(99.5,vehicle.eff*period.eff):null,
      shock:Math.round(vehicle.shock*period.factor),
      fuel:vehicle.fc?vehicle.fc*(2-period.eff):null,
      battery:vehicle.bc?vehicle.bc*period.eff:null
    }
  }
  function summaryData(rows){
    var result={counts:{},km:0,min:0,shock:0,efficiency:[],fuel:[],battery:[]};
    TYPES.forEach(function(type){result.counts[type]=rows.filter(function(vehicle){return vehicle.type===type}).length});
    rows.forEach(function(vehicle){
      var value=periodValue(vehicle);
      result.km+=value.km;
      result.min+=value.min;
      result.shock+=value.shock;
      if(value.efficiency!==null)result.efficiency.push(value.efficiency);
      if(value.fuel!==null)result.fuel.push(value.fuel);
      if(value.battery!==null)result.battery.push(value.battery)
    });
    result.efficiencyAvg=average(result.efficiency);
    result.fuelAvg=average(result.fuel);
    result.batteryAvg=average(result.battery);
    return result
  }
  function typeSummary(data){
    return '엔'+data.counts['엔진']+' · 납'+data.counts['납산']+' · 리'+data.counts['리튬']+' · 수'+data.counts['수소']
  }
  function typeSummaryTitle(data){
    return '엔진 '+data.counts['엔진']+'대 · 납산 '+data.counts['납산']+'대 · 리튬 '+data.counts['리튬']+'대 · 수소 '+data.counts['수소']+'대'
  }
  function renderSummary(rows){
    var data=summaryData(rows);
    var values=[
      '<span title="'+typeSummaryTitle(data)+'">'+typeSummary(data)+'</span>',
      '<span class="na">정보 미제공</span>',
      valueOrUnavailable(data.efficiencyAvg,'%',1),
      num(data.shock)+'회',
      num(data.km)+' Km',
      num(data.min/60)+' H',
      valueOrUnavailable(data.fuelAvg,' ℓ/H',1),
      valueOrUnavailable(data.batteryAvg,' kWh/H',1)
    ];
    var labels=['차량','운영률','운영효율','충격 횟수','거리','시간','평균연료소비량','평균배터리소비량'];
    summaryTable.classList.add('is-updating');
    summaryTable.innerHTML='<table><colgroup><col><col><col><col><col><col><col><col></colgroup><thead><tr>'
      +labels.map(function(label){return'<th scope="col">'+label+'</th>'}).join('')
      +'</tr></thead><tbody><tr>'
      +values.map(function(value,index){return'<td'+(index===3&&data.shock>0?' class="is-alert"':'')+'>'+value+'</td>'}).join('')
      +'</tr></tbody></table>';
    requestAnimationFrame(function(){summaryTable.classList.remove('is-updating')})
  }

  function sortLabel(key){
    var match=SORT_OPTIONS.find(function(item){return item[0]===key});
    return match?match[1]:'차량번호'
  }
  function sortValue(vehicle,key){
    var value=periodValue(vehicle);
    switch(key){
      case'vin':return vehicle.vin;
      case'group':return vehicle.group;
      case'type':return vehicle.type;
      case'cumKm':return vehicle.cumKm;
      case'cumH':return vehicle.cumH;
      case'electricEff':return value.efficiency;
      case'shock':return value.shock;
      case'km':return value.km;
      case'min':return value.min;
      case'conn':return vehicle.conn?1:0;
      case'soc':return vehicle.soc===null?null:vehicle.soc;
      case'fuel':return value.fuel;
      case'battery':return value.battery
    }
    return null
  }
  function sortedRows(rows){
    return rows.slice().sort(function(leftVehicle,rightVehicle){
      var left=sortValue(leftVehicle,state.sortKey);
      var right=sortValue(rightVehicle,state.sortKey);
      var leftMissing=left===null||left===undefined||Number.isNaN(left);
      var rightMissing=right===null||right===undefined||Number.isNaN(right);
      if(leftMissing&&rightMissing)return leftVehicle.vin.localeCompare(rightVehicle.vin,'ko');
      if(leftMissing)return 1;
      if(rightMissing)return-1;
      var result=typeof left==='string'?left.localeCompare(right,'ko'):left-right;
      return result===0?leftVehicle.vin.localeCompare(rightVehicle.vin,'ko'):result*state.sortDir
    })
  }
  function fuelIcon(type){
    var common='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    if(type==='엔진')return'<svg '+common+'><path d="M5 9h2l2-3h6l2 3h2v8H5z"/><path d="M3 11h2m14 1h2m-14 5v2m10-2v2M10 9h4m-5 4h6"/></svg>';
    if(type==='리튬')return'<svg '+common+'><rect x="4" y="6" width="15" height="12" rx="2"/><path d="M19 10h2v4h-2M11 8.5 8.5 13H12l-1 3 4-5h-3z"/></svg>';
    if(type==='납산')return'<svg '+common+'><path d="M6 6V4h3v2m6 0V4h3v2"/><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M6 10h4m-2-2v4m7-2h3m-12 5c2-1 4 1 6 0s4 1 6 0"/></svg>';
    return'<svg '+common+'><path d="M8 4h8v2h2v13H6V6h2z"/><path d="M10 4V2h4v2m-5 7h6m-6 4h6"/></svg>'
  }
  function fuelClass(type){return type==='엔진'?'engine':type==='리튬'?'lithium':type==='납산'?'lead':'hydrogen'}
  function legend(){
    return'<div class="c-fuel-legend" aria-label="동력 유형">'+TYPES.map(function(type){
      return'<span><i class="c-fuel-icon '+fuelClass(type)+'">'+fuelIcon(type)+'</i>'+type+'</span>'
    }).join('')+'</div>'
  }
  function renderToolbar(rows,focusTarget){
    var directionText=state.sortDir===1?'↑ 오름차순':'↓ 내림차순';
    var nextDirection=state.sortDir===1?'내림차순':'오름차순';
    toolbar.innerHTML='<span class="c-list-head__count">차량 상세 <b>'+rows.length+'</b>대</span>'
      +legend()
      +'<span class="c-sort-current">현재 '+sortLabel(state.sortKey)+' · '+(state.sortDir===1?'오름차순':'내림차순')+'</span>'
      +'<div class="c-sort-tools">'
      +'<label class="c-sort-control">정렬 기준 <select class="c-sort-select" id="cSortKey" aria-label="정렬 기준">'
      +SORT_OPTIONS.map(function(item){return'<option value="'+item[0]+'"'+(state.sortKey===item[0]?' selected':'')+'>'+item[1]+'</option>'}).join('')
      +'</select></label>'
      +'<button type="button" class="c-direction-button'+(state.sortDir===-1?' is-desc':'')+'" id="cSortDirection" aria-label="정렬 방향: '+(state.sortDir===1?'오름차순':'내림차순')+'. 클릭하면 '+nextDirection+'">'+directionText+'</button>'
      +'<button type="button" class="c-reset-button" id="cSortReset">초기화</button>'
      +'</div>';
    document.getElementById('cSortKey').addEventListener('change',function(){
      state.sortKey=this.value;
      render('key');
      announce()
    });
    document.getElementById('cSortDirection').addEventListener('click',function(){
      state.sortDir=-state.sortDir;
      render('direction');
      announce()
    });
    document.getElementById('cSortReset').addEventListener('click',function(){
      state.sortKey='vin';
      state.sortDir=1;
      render('reset');
      live.textContent='차량번호 오름차순으로 초기화했습니다.'
    });
    if(focusTarget){requestAnimationFrame(function(){
      var id=focusTarget==='key'?'cSortKey':focusTarget==='direction'?'cSortDirection':'cSortReset';
      var element=document.getElementById(id);
      if(element)element.focus()
    })}
  }
  function announce(){live.textContent=sortLabel(state.sortKey)+' '+(state.sortDir===1?'오름차순':'내림차순')+'으로 정렬했습니다.'}
  function health(vehicle,value){
    if(!vehicle.conn)return{className:'danger',text:'통신 확인'};
    if(vehicle.soc!==null&&vehicle.soc<30)return{className:'warning',text:'잔량 확인'};
    if(value.shock>=5)return{className:'warning',text:'충격 확인'};
    return{className:'normal',text:'정상'}
  }
  function energyColor(value){return value>=60?'#00ad83':value>=30?'#ff9d3b':'#ec2d2d'}
  function energy(vehicle){
    var label=vehicle.type==='엔진'?'잔여 연료':vehicle.type==='수소'?'잔여 수소':'잔여 배터리';
    if(vehicle.soc===null)return'<span class="c-energy-label">'+label+'</span><strong class="c-energy-value unavailable">정보 미제공</strong>';
    return'<span class="c-energy-label">'+label+'</span><i class="c-energy-gauge"><b style="width:'+vehicle.soc+'%;--energy-color:'+energyColor(vehicle.soc)+'"></b></i><strong class="c-energy-value">'+vehicle.soc+'%</strong>'
  }
  function metricClass(keys,extra){
    var classes=[];
    if(keys.indexOf(state.sortKey)>=0)classes.push('is-active');
    if(extra)classes.push(extra);
    return classes.length?' class="'+classes.join(' ')+'"':''
  }
  function consumption(vehicle,value){
    if(vehicle.type==='엔진')return value.fuel===null?'<span class="na">정보 미제공</span>':value.fuel.toFixed(1)+' ℓ/H';
    return value.battery===null?'<span class="na">정보 미제공</span>':value.battery.toFixed(1)+' kWh/H'
  }
  function renderCards(rows){
    if(!rows.length){cards.innerHTML='<div class="c-empty">조회 조건에 해당하는 차량이 없습니다.</div>';return}
    cards.innerHTML=rows.map(function(vehicle,index){
      var value=periodValue(vehicle);
      var status=health(vehicle,value);
      var selected=state.sel&&state.sel.vin===vehicle.vin;
      var periodLabel='<small class="c-period-basis">'+PERIOD[state.period].label+' 기준</small>';
      return'<article class="c-vehicle-card" data-vin="'+escapeAttribute(vehicle.vin)+'" tabindex="0" aria-selected="'+(selected?'true':'false')+'" style="--card-delay:'+(index*16)+'ms">'
        +'<div class="c-card__icon"><i class="c-fuel-icon '+fuelClass(vehicle.type)+'">'+fuelIcon(vehicle.type)+'</i></div>'
        +'<div class="c-card__body">'
        +'<div class="c-card__head">'
        +'<div class="c-card__identity"><a href="'+DETAIL+'?veh='+encodeURIComponent(vehicle.vin)+'">'+vehicle.vin+'</a><span class="c-card__model">'+vehicle.model+'</span><b class="c-type-badge '+fuelClass(vehicle.type)+'">'+fuelIcon(vehicle.type)+'<span>'+vehicle.type+'</span></b></div>'
        +'<div class="c-card__status"><span class="c-health '+status.className+'">'+status.text+'</span><span class="c-connection '+(vehicle.conn?'connected':'disconnected')+'">'+(vehicle.conn?'● 연결됨':'● 연결 끊김')+'</span>'+energy(vehicle)+'</div>'
        +'</div>'
        +'<div class="c-card__info">'
        +'<div><span>소속 업체</span><strong title="'+escapeAttribute(MIQ.COMPANY)+'">'+MIQ.COMPANY+'</strong></div>'
        +'<div'+metricClass(['group'])+'><span>소속 그룹</span><strong>'+vehicle.group+'</strong></div>'
        +'<div'+metricClass(['type'])+'><span>동력 유형</span><strong>'+vehicle.type+'</strong></div>'
        +'<div'+metricClass(['cumKm'])+'><span>누적 이동거리</span><strong>'+num(vehicle.cumKm)+' Km</strong></div>'
        +'<div'+metricClass(['cumH'])+'><span>누적 가동시간</span><strong>'+num(vehicle.cumH)+' H</strong></div>'
        +'<div><span>TMS Serial</span><strong class="na">정보 미제공</strong></div>'
        +'</div>'
        +'<div class="c-card__metrics">'
        +'<div><span>운영률 '+periodLabel+'</span><strong class="na">정보 미제공</strong></div>'
        +'<div'+metricClass(['electricEff'])+'><span>운영효율 '+periodLabel+'</span><strong>'+(value.efficiency===null?'<span class="na">정보 미제공</span>':value.efficiency.toFixed(1)+'%')+'</strong></div>'
        +'<div'+metricClass(['shock'],value.shock>=5?'is-alert':'')+'><span>충격 횟수 '+periodLabel+'</span><strong>'+num(value.shock)+'회</strong></div>'
        +'<div'+metricClass(['km'])+'><span>기간 이동거리 '+periodLabel+'</span><strong>'+num(value.km,value.km<10?1:0)+' Km</strong></div>'
        +'<div'+metricClass(['min'])+'><span>기간 가동시간 '+periodLabel+'</span><strong>'+hm(value.min)+'</strong></div>'
        +'<div'+metricClass(['fuel','battery'])+'><span title="'+(vehicle.type==='엔진'?'평균연료소비량':'평균배터리소비량')+' · '+PERIOD[state.period].label+' 기준">평균 소비량 '+periodLabel+'</span><strong>'+consumption(vehicle,value)+'</strong></div>'
        +'</div></div></article>'
    }).join('')
  }
  function renderChrome(){
    var vehicle=selectedVehicle();
    var label=vehicle?vehicle.vin+' · '+vehicle.model:state.sel&&state.sel.label?state.sel.label:'전체';
    document.getElementById('scopeTitle').textContent='- '+label;
    var range=PERIOD[state.period].range;
    var inputs=document.querySelectorAll('#dateRange input');
    if(inputs.length===2){
      inputs[0].value=range[0];
      inputs[1].value=range[1];
      inputs[0].disabled=state.period!=='c';
      inputs[1].disabled=state.period!=='c'
    }
  }
  function render(focusTarget){
    var source=filtered();
    var ordered=sortedRows(source);
    renderChrome();
    renderSummary(source);
    renderToolbar(ordered,focusTarget);
    renderCards(ordered)
  }
  function selectVehicle(vin){
    var selected=state.sel&&state.sel.vin===vin;
    tree.set({vin:selected?null:vin})
  }

  document.getElementById('periodTabs').addEventListener('click',function(event){
    var button=event.target.closest('button[data-period]');
    if(!button)return;
    Array.prototype.forEach.call(this.querySelectorAll('button'),function(item){item.classList.remove('active')});
    button.classList.add('active');
    state.period=button.getAttribute('data-period');
    render();
    live.textContent=PERIOD[state.period].label+' 기준 값을 표시합니다.'
  });
  document.getElementById('runSearch').addEventListener('click',function(){render();live.textContent=PERIOD[state.period].label+' 기준으로 조회했습니다.'});
  cards.addEventListener('click',function(event){
    if(event.target.closest('a,button,select,input'))return;
    var card=event.target.closest('[data-vin]');
    if(card)selectVehicle(card.getAttribute('data-vin'))
  });
  cards.addEventListener('keydown',function(event){
    if(event.target.closest('a,button,select,input'))return;
    if(event.key!=='Enter'&&event.key!==' ')return;
    var card=event.target.closest('[data-vin]');
    if(!card)return;
    event.preventDefault();
    selectVehicle(card.getAttribute('data-vin'))
  });
  document.addEventListener('miq:target-change',function(event){
    var vin=event.detail&&event.detail.equipmentId;
    var exists=vin&&VEHICLES.some(function(vehicle){return vehicle.vin===vin});
    if(exists)tree.set({group:null,type:null,vin:vin});
    else if(!vin&&state.sel&&state.sel.vin)tree.set({group:null,type:null,vin:null})
  });

  render()
})();
