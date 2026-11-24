/* =========================================================
   여행틈 AI 추천 서버 (Cloudflare Worker)

   이 파일 전체를 Cloudflare 화면의 코드 편집기에 붙여 넣으세요.
   비밀번호나 키는 들어 있지 않아서 GitHub에 함께 올라가도 괜찮아요.

   하는 일
   1) 홈페이지가 보낸 질문과 가게 목록을 받아요.
   2) Cloudflare의 무료 AI에게 "이 목록 안에서 골라 줘"라고 물어봐요.
   3) AI의 답을 검사해서 홈페이지로 돌려줘요.

   꼭 고칠 곳: 아래 ALLOWED_ORIGINS 의 주소
   ========================================================= */

/* 이 주소에서 온 요청만 받아요. 홈페이지 주소의 "앞부분"만 적어요.
   예) 홈페이지가 https://siyeonee22.github.io/yeohaengteum/ 이면
       "https://siyeonee22.github.io" 까지만 적어요. (끝에 / 없이) */
const ALLOWED_ORIGINS = [
  "https://siyeonee22.github.io",
];

/* 사용할 AI 모델. 앞에서부터 차례로 시도하고, 막히면 다음 모델로 넘어가요.
   - Qwen 3 : 한국어를 잘하고 사용량이 적게 들어요.
   - Llama 3.3 : 예비용. 사용량이 많이 들어서 하루에 쓸 수 있는 횟수가 줄어요. */
const MODELS = [
  "@cf/qwen/qwen3-30b-a3b-fp8",
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
];

const MAX_QUESTION = 300;   // 질문 글자 수 제한
const MAX_PLACES = 80;      // 한 번에 받는 가게 수 제한

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed =
      ALLOWED_ORIGINS.includes(origin) ||
      origin.startsWith("http://localhost") ||     // 내 컴퓨터에서 시험할 때 (VS Code Live Server)
      origin.startsWith("http://127.0.0.1");
    const cors = {
      "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method === "GET") {
      return json({ ok: true, message: "여행틈 AI 서버가 켜져 있어요.", ai: !!env.AI }, 200, cors);
    }
    if (request.method !== "POST") return json({ error: "POST 요청만 받아요." }, 405, cors);
    if (!allowed) return json({ error: "허용되지 않은 주소에서 온 요청이에요. ALLOWED_ORIGINS를 확인하세요." }, 403, cors);
    if (!env.AI) return json({ error: "Workers AI 연결(바인딩)이 없어요. 변수 이름을 AI로 추가하세요." }, 500, cors);

    // ---- 받은 내용 꺼내기 ----
    let body;
    try {
      const raw = await request.text();
      if (raw.length > 60000) return json({ error: "보낸 내용이 너무 커요." }, 413, cors);
      body = JSON.parse(raw);
    } catch (e) {
      return json({ error: "보낸 내용을 읽지 못했어요." }, 400, cors);
    }

    const q = String(body.q || "").trim().slice(0, MAX_QUESTION);
    if (!q) return json({ error: "질문이 비어 있어요." }, 400, cors);
    const now = String(body.now || "").slice(0, 40);
    const regions = cleanMap(body.regions, 40);
    const cats = cleanMap(body.cats, 20);
    const places = (Array.isArray(body.places) ? body.places : []).slice(0, MAX_PLACES).map(cleanPlace).filter(Boolean);
    if (!places.length) return json({ error: "가게 목록이 비어 있어요." }, 400, cors);

    // ---- AI에게 물어보기 ----
    const messages = [
      { role: "system", content: systemPrompt(regions, cats) },
      {
        role: "user",
        content:
          "[지금 시각] " + (now || "모름") + "\n" +
          "[가게 목록]\n" + places.map((p) => JSON.stringify(p)).join("\n") + "\n\n" +
          "[여행자의 말] " + q + "\n\n" +
          "JSON 하나만 출력해. /no_think",
      },
    ];

    let lastError = "";
    for (const model of MODELS) {
      try {
        const out = await env.AI.run(model, { messages, max_tokens: 900, temperature: 0.3 });
        const parsed = pickJSON(textOf(out));
        if (!parsed) { lastError = model + ": 답을 JSON으로 읽지 못함"; continue; }
        const result = validate(parsed, places, regions, cats);
        result.model = model;
        return json(result, 200, cors);
      } catch (e) {
        lastError = model + ": " + (e && e.message ? e.message : String(e));
      }
    }
    return json({ error: "AI가 지금 답하지 못했어요.", detail: lastError }, 502, cors);
  },
};

/* ---------- AI에게 주는 안내문 ---------- */
function systemPrompt(regions, cats) {
  return [
    "너는 강릉 여행 안내 서비스 '여행틈'의 추천 도우미야.",
    "여행자가 남는 시간과 상황을 말하면, [가게 목록] 안에서만 들를 곳을 골라.",
    "",
    "가게 목록의 칸 뜻: id=번호, n=이름, c=종류, r=지역, d=머무는 시간(분), h=여는 시간, s=소개, t=태그, f=동행 조건, b=예약 필요(1이면 필요)",
    "지역 키: " + JSON.stringify(regions),
    "종류 키: " + JSON.stringify(cats),
    "동행 키: kid=아이와 함께, senior=부모님과 함께, wheel=휠체어",
    "",
    "규칙",
    "- 목록에 없는 가게는 절대 지어내지 마.",
    "- 지금 시각과 h를 보고, 지금 문을 닫았거나 오늘 쉬는 곳은 빼. h가 '확인 필요'면 넣어도 돼.",
    "- 여행자가 아이, 부모님, 휠체어를 말하면 withs에 넣고, f에 그 키가 있는 곳만 골라.",
    "- b가 1인 곳은 여행자가 원할 때만 골라.",
    "- 비, 추위, 조용한 곳, 사진, 선물, 배고픔 같은 분위기 요청을 꼭 반영해.",
    "- 이동 시간은 홈페이지가 따로 계산하니, 출발 지역과 가까운 곳 위주로 2~4곳을 좋은 순서대로 골라.",
    "- reasons는 가게마다 왜 골랐는지 짧은 한 문장. message는 여행자에게 건네는 따뜻한 한두 문장.",
    "- 모든 문장은 한국어 존댓말로 써.",
    "",
    "반드시 아래 모양의 JSON 하나만 출력하고, 다른 말이나 ``` 표시는 쓰지 마.",
    '{"minutes": 남은 시간(분 숫자, 모르면 null), "start": "출발 지역 키 또는 null", "withs": ["kid"], "cats": ["book"], "picks": [3, 10], "reasons": {"3": "이유", "10": "이유"}, "message": "한두 문장"}',
  ].join("\n");
}

/* ---------- 도우미 ---------- */
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, headers || {}),
  });
}

function cleanMap(m, max) {
  const out = {};
  if (!m || typeof m !== "object") return out;
  Object.keys(m).slice(0, max).forEach((k) => {
    if (/^[a-z0-9_-]{1,30}$/i.test(k)) out[k] = String(m[k]).slice(0, 30);
  });
  return out;
}

function cleanPlace(p) {
  if (!p || typeof p !== "object") return null;
  const id = parseInt(p.id, 10);
  if (!id) return null;
  const s = (v, n) => String(v == null ? "" : v).slice(0, n);
  return {
    id,
    n: s(p.n, 40), c: s(p.c, 20), r: s(p.r, 20),
    d: Math.max(0, Math.min(600, parseInt(p.d, 10) || 0)),
    h: s(p.h, 80), s: s(p.s, 60), t: s(p.t, 60), f: s(p.f, 30),
    b: p.b ? 1 : 0,
  };
}

/* AI 답에서 글자만 꺼내기 (모델마다 답 모양이 달라요) */
function textOf(r) {
  if (!r) return "";
  if (typeof r === "string") return r;
  if (typeof r.response === "string") return r.response;
  if (r.response && typeof r.response === "object") return JSON.stringify(r.response);
  const c = r.choices && r.choices[0];
  if (c) {
    if (c.message && typeof c.message.content === "string") return c.message.content;
    if (typeof c.text === "string") return c.text;
  }
  return "";
}

/* 글 속에서 JSON 부분만 찾아 읽기 */
function pickJSON(text) {
  if (!text) return null;
  text = text.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/```(?:json)?/g, "");
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { return null; }
}

/* AI 답이 엉뚱하지 않은지 검사하고, 쓸 수 있는 것만 남기기 */
function validate(x, places, regions, cats) {
  const ids = new Set(places.map((p) => p.id));
  const picks = [];
  (Array.isArray(x.picks) ? x.picks : []).forEach((v) => {
    const id = parseInt(v, 10);
    if (ids.has(id) && picks.indexOf(id) < 0 && picks.length < 6) picks.push(id);
  });
  const reasons = {};
  if (x.reasons && typeof x.reasons === "object") {
    picks.forEach((id) => {
      const r = x.reasons[id] || x.reasons[String(id)];
      if (r) reasons[id] = String(r).slice(0, 120);
    });
  }
  let minutes = parseInt(x.minutes, 10);
  if (!(minutes >= 10 && minutes <= 720)) minutes = null;
  const start = typeof x.start === "string" && regions[x.start] ? x.start : null;
  const okWith = ["kid", "senior", "wheel"];
  const withs = (Array.isArray(x.withs) ? x.withs : []).filter((w) => okWith.indexOf(w) >= 0);
  const catList = (Array.isArray(x.cats) ? x.cats : []).filter((c) => cats[c]);
  const message = typeof x.message === "string" ? x.message.slice(0, 200) : "";
  return { minutes, start, withs, cats: catList, picks, reasons, message };
}
