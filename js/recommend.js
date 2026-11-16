/* 여행틈 — 틈새 추천
   지금은 문장 속 단어를 찾는 규칙으로 답합니다.
   실제 AI를 붙일 때는 이 파일의 answer() 안에서 서버에 물어보도록 바꾸면 됩니다. */
/* ---------- 틈새 추천 (규칙 기반 데모) ---------- */
var NUM={"한":1,"두":2,"세":3,"네":4,"다섯":5,"여섯":6};
var CAT_KW={book:["책","서점","독서","북카페"],goods:["소품","기념품","굿즈","선물","쇼핑","감자","편집숍","리빙","엽서"],art:["그림","미술","공방","체험","클래스","그리","자수","두부","전통차","컵 만들"],cafe:["카페","커피","디저트","라테","쉬고"],culture:["영화","음악","LP","엘피","바이닐","청음"]};
function parseQuery(q){
  var min=0, m=q.match(/(\d+(?:\.\d+)?|한|두|세|네|다섯|여섯)\s*시간(\s*반)?/);
  if(m){min+=Math.round((NUM[m[1]]||parseFloat(m[1]))*60); if(m[2]) min+=30;}
  var mm=q.match(/(\d+)\s*분/); if(mm) min+=parseInt(mm[1],10);
  if(!min&&/반나절/.test(q)) min=240;
  var region=null;
  Object.keys(REGIONS).forEach(function(k){REGIONS[k].kw.forEach(function(w){if(!region&&q.indexOf(w)>=0) region=k;});});
  var cats=[];
  Object.keys(CAT_KW).forEach(function(k){if(CAT_KW[k].some(function(w){return q.indexOf(w)>=0;})) cats.push(k);});
  var withs=[];
  if(/아이(?!스)|아기|애기|어린이|유아|유모차|초등|조카/.test(q)) withs.push("kid");
  if(/부모님|어머니|아버지|엄마|아빠|할머니|할아버지|어르신|효도/.test(q)) withs.push("senior");
  if(/휠체어|전동차|거동/.test(q)) withs.push("wheel");
  return {min:min,region:region,cats:cats,withs:withs};
}
/* 동행에 따라 타고 내리는 시간을 더 잡고, 이동 수단 이름을 바꿔요 */
function tripMode(withs){
  var wheel=withs.indexOf("wheel")>=0, kid=withs.indexOf("kid")>=0, senior=withs.indexOf("senior")>=0;
  return {extra:wheel?10:(kid||senior?5:0), ride:wheel?"장애인 콜택시로":(kid||senior?"택시로":"차로"), walk:wheel?"휠체어로":"걸어서", max:kid?3:4};
}
function buildPlan(start,budget,cats,pool,mode){
  function tv(a,b){return travel(a,b)+(isWalk(a,b)?(mode.extra?3:0):mode.extra);} // 걸어갈 때는 조금만 더
  function label(a,b){return (isWalk(a,b)?mode.walk:mode.ride)+" 약 "+tv(a,b)+"분";}
  var t=0,cur=start,stops=[],used={};
  pool=pool.slice();
  while(stops.length<mode.max){
    var best=null,bestScore=1e9;
    pool.forEach(function(s){
      var go=tv(cur,s.region);
      if(t+go+s.dur+tv(s.region,start)>budget) return;
      var score=go+(cats.length&&cats.indexOf(s.cat)<0?40:0)+(used[s.cat]?8:0)+(s.book?30:0);
      if(score<bestScore){bestScore=score;best=s;}
    });
    if(!best) break;
    var go=tv(cur,best.region);
    stops.push({shop:best,move:label(cur,best.region),arrive:t+go});
    t+=go+best.dur; cur=best.region; used[best.cat]=true;
    pool=pool.filter(function(s){return s!==best;});
  }
  var back=stops.length?tv(cur,start):0;
  return {stops:stops,backText:label(cur,start),total:t+back};
}
var TIPS={
  kid:["택시나 자가용이 편해요. 카시트가 필요하면 미리 챙겨 주세요.","아이와 가도 괜찮다고 확인된 곳만 골랐고, 지치지 않게 세 곳까지만 넣었어요."],
  senior:["택시를 권해요. 걷는 구간은 짧게, 타고 내리는 시간은 넉넉히 잡았어요.","1층이거나 앉아 쉴 자리가 있다고 확인된 곳만 골랐어요."],
  wheel:["장애인 콜택시(특별교통수단)나 저상버스를 권해요. 배차를 기다릴 수 있어 차로 옮길 때마다 10분씩 더 잡았어요.","휠체어로 들어갈 수 있다고 확인된 곳만 골라요."]
};
function answer(q){
  var p=parseQuery(q), notes=[];
  var start=p.region||"station", budget=p.min||120, mode=tripMode(p.withs);
  if(!p.min) notes.push("남은 시간을 못 찾아서 2시간으로 잡았어요.");
  if(!p.region) notes.push("위치를 못 찾아서 강릉역에서 출발하는 걸로 잡았어요.");
  var pool=SHOPS.filter(function(s){return p.withs.every(function(w){return s[w];});});
  var plan=buildPlan(start,budget,p.cats,pool,mode), R=REGIONS[start].name, html;
  var who=p.withs.map(function(w){return WITH[w].replace(" 가능","로");}).join(", ");
  function stopBtn(s,extra){return '<button class="stop" type="button" data-id="'+s.id+'"><b>'+esc(s.name)+'</b><small>'+CATS[s.cat].name+' · '+REGIONS[s.region].name+extra+(s.book?' · 예약 필요':'')+' · '+esc(s.short)+(p.withs.length?'<br>'+esc(s.acc):'')+'</small></button>';}
  if(!pool.length){
    html='<h3>조건에 맞게 확인된 곳이 아직 없어요</h3><p>출입구 턱이나 엘리베이터처럼 직접 가서 봐야 하는 정보는 아직 모으는 중이에요. 아래 목록에서 가게별 안내를 보시고, 방문 전에 가게에 문의해 주세요.</p>';
  } else if(!plan.stops.length){
    var near=pool.slice().sort(function(a,b){return (travel(start,a.region)+a.dur)-(travel(start,b.region)+b.dur);})[0];
    html='<h3>'+fmt(budget)+'은 조금 빠듯해요</h3><p>'+R+'에서 가장 짧게 들를 수 있는 곳은 여기예요. 이동까지 넣으면 약 '+fmt((travel(start,near.region)+mode.extra)*2+near.dur)+'이 필요해요.</p>'+
      '<ol class="plan"><li><span class="when">가까운 곳</span><div>'+stopBtn(near,'')+'</div></li></ol>';
  } else {
    var spare=budget-plan.total;
    html='<h3>'+(who?who+', ':'')+R+'에서 '+fmt(budget)+'</h3><p>'+(p.cats.length?p.cats.map(function(c){return CATS[c].name;}).join("·")+" 위주로 골랐어요. ":"")+
      '모두 '+plan.stops.length+'곳, 돌아오는 시간까지 약 '+fmt(plan.total)+'이에요.</p>';
    html+='<ol class="plan">'+
      plan.stops.map(function(st){
        return '<li><span class="when">'+clock(st.arrive)+'</span><div><div class="move">'+st.move+' 이동</div>'+stopBtn(st.shop,' · 약 '+fmt(st.shop.dur))+'</div></li>';
      }).join("")+
      '<li><span class="when">'+clock(plan.total)+'</span><div><div class="move">'+plan.backText+' 이동</div>'+R+' 도착'+(spare>0?' · 여유 '+fmt(spare):'')+'</div></li></ol>';
  }
  if(p.withs.length){
    html+='<div class="tips">'+p.withs.map(function(w){return '<div><b>'+WITH[w].replace(" 가능"," 이용")+'</b>이동은 '+TIPS[w][0]+' 장소는 '+TIPS[w][1]+'</div>';}).join("")+'</div>';
  }
  if(notes.length) html+='<p class="note">'+notes.join(" ")+'</p>';
  $("aiOut").innerHTML='<div class="bubble me">'+esc(q)+'</div><div class="bubble bot">'+html+'</div>';
}
