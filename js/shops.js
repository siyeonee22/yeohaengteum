/* 여행틈 — 가게 목록, 필터(종류·지역·동행·키워드), 상세 창 */
/* ---------- 목록 + 필터 ---------- */
var state={cat:"all",region:"all",kw:"",withs:{},start:"station",sort:"base"};
function renderCats(){
  $("withRow").innerHTML='<span>함께 가는 사람</span>'+Object.keys(WITH).map(function(k){return '<button class="wbtn" type="button" data-with="'+k+'" aria-pressed="false">'+WITH[k]+'</button>';}).join("");
  var html='<button class="cat" type="button" data-cat="all" aria-pressed="true" style="padding-left:16px">전체</button>';
  Object.keys(CATS).forEach(function(k){
    html+='<button class="cat" type="button" data-cat="'+k+'" aria-pressed="false"><span class="ic" style="--c:'+CATS[k].color+'">'+icon(k)+'</span>'+CATS[k].name+'</button>';
  });
  $("catRow").innerHTML=html;
  var opt='<option value="all">강릉 전체</option>';
  Object.keys(REGIONS).filter(function(k){return SHOPS.some(function(x){return x.region===k;});}).forEach(function(k){opt+='<option value="'+k+'">'+REGIONS[k].name+'</option>';});
  $("regionSel").innerHTML=opt;
  /* 출발지: 자주 가는 곳 + 강릉 읍·면·동 */
  var so='<optgroup label="자주 가는 곳">';
  ["station","market","gyodong","anmok","chodang","gyeongpo","ojuk","jumunjin"].forEach(function(k){so+='<option value="'+k+'">'+REGIONS[k].name+'</option>';});
  so+='</optgroup><optgroup label="강릉 읍·면·동">';
  Object.keys(STARTS).forEach(function(k){so+='<option value="'+k+'">'+STARTS[k].name+'</option>';});
  $("startSel").innerHTML=so+'</optgroup>';
}
function renderGrid(){
  var kw=state.kw.trim().toLowerCase();
  var list=SHOPS.filter(function(s){
    if(state.cat!=="all"&&s.cat!==state.cat) return false;
    if(state.region!=="all"&&s.region!==state.region) return false;
    for(var w in state.withs){ if(state.withs[w]&&!s[w]) return false; }
    if(kw){
      var hay=(s.name+" "+s.short+" "+s.long+" "+s.prog+" "+s.tags.join(" ")+" "+CATS[s.cat].name+" "+REGIONS[s.region].name).toLowerCase();
      if(hay.indexOf(kw)<0) return false;
    }
    return true;
  });
  if(state.sort==="near") list=list.slice().sort(function(a,b){return travel(state.start,a.region)-travel(state.start,b.region);});
  $("count").textContent=list.length+"곳을 찾았어요";
  if(!list.length){
    $("grid").innerHTML='<div class="empty"><h3>조건에 맞는 곳이 아직 없어요</h3><p>종류나 지역을 바꿔 보세요.</p><p style="margin-top:12px"><button class="btn btn-sub" type="button" id="resetBtn">조건 지우기</button></p></div>';
    return;
  }
  $("grid").innerHTML=list.map(function(s){
    var c=CATS[s.cat];
    return '<button class="card" type="button" data-id="'+s.id+'" aria-label="'+esc(s.name)+' 자세히 보기">'+
      '<div class="thumb" style="--c:'+c.color+'">'+thumbImg(s)+'</div>'+
      '<div class="card-body"><div class="tagline"><span class="pill" style="--c:'+c.color+'">'+c.name+'</span><span class="pill region">'+REGIONS[s.region].name+'</span>'+(s.book?'<span class="pill region">예약 필요</span>':'')+'</div>'+
      '<h3>'+esc(s.name)+'</h3><p>'+esc(s.short)+'</p>'+withPills(s)+
      '<p class="from">'+esc(placeName(state.start))+'에서 '+moveText(state.start,s.region)+'</p>'+
      '<div class="meta"><span>약 '+fmt(s.dur)+'</span><span>'+esc(s.price)+'</span></div></div></button>';
  }).join("");
}
function setCat(k){
  state.cat=k;
  Array.prototype.forEach.call(document.querySelectorAll(".cat"),function(b){b.setAttribute("aria-pressed",b.dataset.cat===k?"true":"false");});
  renderGrid();
}

/* ---------- 상세 ---------- */
function openDetail(id){
  var s=SHOPS.filter(function(x){return x.id===+id;})[0]; if(!s) return;
  var c=CATS[s.cat], dlg=$("detail");
  dlg.innerHTML='<div class="d-thumb" style="--c:'+c.color+'">'+thumbImg(s)+'<button class="d-close" type="button" aria-label="닫기" data-close>×</button></div>'+
    '<div class="d-body"><div class="tagline"><span class="pill" style="--c:'+c.color+'">'+c.name+'</span><span class="pill region">'+REGIONS[s.region].name+'</span>'+(s.book?'<span class="pill region">예약 필요</span>':'')+'</div>'+
    '<h2 id="dName">'+esc(s.name)+'</h2><p>'+esc(s.long)+'</p>'+
    '<div class="prog"><h3>이런 걸 해요</h3><p>'+esc(s.prog)+'</p></div>'+
    '<dl class="info">'+
    '<div><dt>걸리는 시간</dt><dd>약 '+fmt(s.dur)+'</dd></div>'+
    '<div><dt>가격</dt><dd>'+esc(s.price)+'</dd></div>'+
    '<div><dt>여는 시간</dt><dd>'+esc(s.hours)+'</dd></div>'+
    (state.start==="station"&&s.station?'<div><dt>강릉역에서</dt><dd>'+esc(s.station)+'</dd></div>':
      '<div><dt>'+esc(placeName(state.start))+'에서</dt><dd>'+moveText(state.start,s.region)+' ('+kmText(state.start,s.region)+', 어림)</dd></div>')+
    '<div style="grid-column:1/-1"><dt>주소</dt><dd>'+esc(s.addr)+'</dd></div>'+
    '<div style="grid-column:1/-1"><dt>함께 가기</dt><dd>'+esc(s.acc)+'</dd>'+withPills(s)+'</div></dl>'+
    '<a class="btn btn-main map-btn" href="'+mapUrl(s)+'" target="_blank" rel="noopener">네이버 지도에서 보기</a>'+
    '<div class="tags">'+s.tags.map(function(t){return '<span>#'+esc(t)+'</span>';}).join("")+'</div>'+
    '<p class="note">운영 시간과 가격은 바뀔 수 있어요. 방문 전에 확인해 주세요.</p></div>';
  if(dlg.open) dlg.close();
  dlg.showModal();
}
