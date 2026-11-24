/* 여행틈 — 여러 파일이 함께 쓰는 작은 도구들 */
/* ---------- 도우미 ---------- */
function $(id){return document.getElementById(id);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function icon(cat){return '<img class="icon" src="'+CATS[cat].icon+'" alt="">';}
/* 가게 사진이 있으면 사진을, 없으면 종류 아이콘을 보여 줘요 */
function thumbImg(s){return s.image?'<img class="photo" src="'+esc(s.image)+'" alt="'+esc(s.name)+' 사진">':icon(s.cat);}
/* 아이·부모님·휠체어 표시 */
function withPills(s){return '<div class="withs">'+Object.keys(WITH).filter(function(k){return s[k];}).map(function(k){return '<span class="wp">'+WITH[k]+'</span>';}).join("")+'</div>';}
/* 지역 이름(키)으로 위치·이름 찾기: 가게 동네(REGIONS)와 읍·면·동(STARTS) 모두 */
function placeOf(k){return REGIONS[k]||(typeof STARTS!=="undefined"&&STARTS[k])||REGIONS.station;}
function placeName(k){return placeOf(k).name;}
function dist(a,b){ // 두 지역 사이 직선거리(km) 어림값
  var p=placeOf(a).xy,q=placeOf(b).xy;
  return Math.sqrt(Math.pow(p[0]-q[0],2)+Math.pow(p[1]-q[1],2));
}
/* 같은 동네이거나 직선 1.6km 안쪽이면 걸어간다고 봐요 (실제 길은 직선보다 30%쯤 길어요) */
function isWalk(a,b){return a===b||dist(a,b)<=1.6;}
function travel(a,b){ // 분 단위 어림값. 걷기 1km에 약 14분, 차는 시내 평균 속도로 계산
  if(a===b) return 5;
  var d=dist(a,b);
  return isWalk(a,b)?Math.max(5,Math.round(d*1.3*14)):Math.round(5+d*1.4);
}
function kmText(a,b){var d=dist(a,b)*1.3; return d<1?"약 "+Math.round(d*10)*100+"m":"약 "+(Math.round(d*10)/10)+"km";}
function moveText(a,b){return (isWalk(a,b)?"걸어서":"차로")+" 약 "+travel(a,b)+"분";}
function fmt(min){var h=Math.floor(min/60),m=min%60;return (h?h+"시간":"")+(h&&m?" ":"")+(m||!h?m+"분":"");}
function clock(min){var h=Math.floor(min/60),m=min%60;return "+"+h+":"+(m<10?"0":"")+m;}

/* 네이버 지도 검색 주소 만들기 (키 없이 누구나 열 수 있어요) */
function mapQuery(s){return s.map||(s.name.indexOf("강릉")>=0?s.name:"강릉 "+s.name);}
function mapUrl(s){return "https://map.naver.com/p/search/"+encodeURIComponent(mapQuery(s));}
