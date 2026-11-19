/* 여행틈 — 시작 파일: 버튼·입력창에 동작을 연결하고 첫 화면을 그립니다 */
/* ---------- 이벤트 ---------- */
var EXAMPLES=["시간 3시간 남고 지금 강릉역 앞인데 할 만한 거 추천해줘","어린아이랑 중앙시장에서 한 시간 반","부모님 모시고 강릉역에서 2시간, 책방 위주로","초당에서 2시간, 체험하고 카페 가고 싶어","안목해변에서 2시간, 음악 듣고 싶어","휠체어 이용객인데 강릉역에서 2시간"];
$("aiChips").innerHTML=EXAMPLES.map(function(e,i){return '<button class="chip" type="button" data-ex="'+i+'">'+esc(e)+'</button>';}).join("");
$("aiChips").addEventListener("click",function(e){var b=e.target.closest("[data-ex]"); if(!b) return; var q=EXAMPLES[+b.dataset.ex]; $("aiInput").value=q; answer(q);});
$("aiForm").addEventListener("submit",function(e){e.preventDefault(); var q=$("aiInput").value.trim(); if(!q){$("aiInput").focus();return;} answer(q);});
$("aiOut").addEventListener("click",function(e){var b=e.target.closest("[data-id]"); if(b) openDetail(b.dataset.id);});
$("catRow").addEventListener("click",function(e){var b=e.target.closest("[data-cat]"); if(b) setCat(b.dataset.cat);});
$("regionSel").addEventListener("change",function(e){state.region=e.target.value; renderGrid();});
$("kw").addEventListener("input",function(e){state.kw=e.target.value; renderGrid();});
$("grid").addEventListener("click",function(e){
  if(e.target.closest("#resetBtn")){state.region="all";state.kw="";state.withs={};
    Array.prototype.forEach.call(document.querySelectorAll(".wbtn"),function(b){b.setAttribute("aria-pressed","false");});$("regionSel").value="all";$("kw").value="";setCat("all");return;}
  var c=e.target.closest("[data-id]"); if(c) openDetail(c.dataset.id);
});
$("detail").addEventListener("click",function(e){if(e.target===this||e.target.closest("[data-close]")) this.close();});

$("withRow").addEventListener("click",function(e){var b=e.target.closest("[data-with]"); if(!b) return;
  var k=b.dataset.with; state.withs[k]=!state.withs[k]; b.setAttribute("aria-pressed",state.withs[k]?"true":"false"); renderGrid();});

/* 메인 화면: 일정 사이의 틈이 벌어지는 장면을 바꿔 가며 보여 줘요 */
var SCENES=[["13:10","강릉 도착","3시간의 틈","16:10","기차 출발"],["11:00","숙소 체크아웃","2시간의 틈","13:00","점심 약속"],["15:00","일정 끝","1시간 반의 틈","16:30","KTX 출발"]], sceneNo=0;
if(window.matchMedia&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  setInterval(function(){
    sceneNo=(sceneNo+1)%SCENES.length; var s=SCENES[sceneNo], g=$("gapStrip");
    $("gsA1").textContent=s[0]; $("gsA2").textContent=s[1]; $("gsLabel").textContent=s[2]; $("gsB1").textContent=s[3]; $("gsB2").textContent=s[4];
    g.classList.remove("play"); void g.offsetWidth; g.classList.add("play");
  },5000);
}

renderCats(); renderGrid();
answer(EXAMPLES[0]); // 첫 화면에 예시 답변을 보여 줘요
