/* 여행틈 — 여러 파일이 함께 쓰는 작은 도구들 */
/* ---------- 도우미 ---------- */
function $(id){return document.getElementById(id);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function icon(cat){return '<img class="icon" src="'+CATS[cat].icon+'" alt="">';}
/* 가게 사진이 있으면 사진을, 없으면 종류 아이콘을 보여 줘요 */
function thumbImg(s){return s.image?'<img class="photo" src="'+esc(s.image)+'" alt="'+esc(s.name)+' 사진">':icon(s.cat);}
/* 아이·부모님·휠체어 표시 */
function withPills(s){return '<div class="withs">'+Object.keys(WITH).filter(function(k){return s[k];}).map(function(k){return '<span class="wp">'+WITH[k]+'</span>';}).join("")+'</div>';}
function dist(a,b){ // 두 지역 사이 거리(km) 어림값
  var p=REGIONS[a].xy,q=REGIONS[b].xy;
  return Math.sqrt(Math.pow(p[0]-q[0],2)+Math.pow(p[1]-q[1],2));
}
/* 같은 동네이거나 1.2km 안쪽이면 걸어간다고 봐요 */
function isWalk(a,b){return a===b||dist(a,b)<=1.2;}
function travel(a,b){ // 분 단위 어림값
  if(a===b) return 5;
  var d=dist(a,b);
  return d<=1.2?Math.max(6,Math.round(d*15)):Math.round(d*2.5+4);
}
function moveText(a,b){return (isWalk(a,b)?"걸어서":"차로")+" 약 "+travel(a,b)+"분";}
function fmt(min){var h=Math.floor(min/60),m=min%60;return (h?h+"시간":"")+(h&&m?" ":"")+(m||!h?m+"분":"");}
function clock(min){var h=Math.floor(min/60),m=min%60;return "+"+h+":"+(m<10?"0":"")+m;}

/* 네이버 지도 검색 주소 만들기 (키 없이 누구나 열 수 있어요) */
function mapQuery(s){return s.map||(s.name.indexOf("강릉")>=0?s.name:"강릉 "+s.name);}
function mapUrl(s){return "https://map.naver.com/p/search/"+encodeURIComponent(mapQuery(s));}
