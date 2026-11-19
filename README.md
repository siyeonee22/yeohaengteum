# 여행틈

강릉의 공방과 동네 상점을 소개하고, 여행 사이 남는 시간에 맞춰 코스를 추천하는 관광 홈페이지 시제품입니다.
실제 가게 36곳이 들어 있습니다. 운영 시간·가격·접근성은 찾은 만큼만 적었고, 못 찾은 곳은 "확인 필요"로 두었습니다.

## 사용한 기술

| 기술 | 하는 일 | 파일 |
|---|---|---|
| HTML | 화면의 뼈대(제목, 버튼, 입력창이 어디에 있는지) | `index.html` |
| CSS | 꾸밈(색, 글씨체, 배치, 움직임, 휴대폰·PC 대응) | `css/style.css` |
| JavaScript | 동작(검색, 필터, 추천, 상세 창) | `js/`, `data/` |
| SVG | 선과 도형으로 그린 그림 파일. 확대해도 깨지지 않음 | `images/` |
| Google Fonts | 글씨체(Jua, Gowun Dodum, Gaegu)를 인터넷에서 불러옴 | `index.html` 윗부분 |

설치해야 하는 프로그램이나 라이브러리는 없습니다. 글씨체만 인터넷 연결이 필요합니다.

## 폴더 구조

```
yeohaengteum/
├── index.html            화면 뼈대. 브라우저가 가장 먼저 여는 파일
├── css/
│   └── style.css         디자인 전체. 맨 위 :root 에 색·글씨체 값이 모여 있음
├── js/
│   ├── utils.js          여러 곳에서 쓰는 작은 도구 (이동 시간 계산, 시간 표시 등)
│   ├── shops.js          가게 목록, 필터, 상세 창
│   ├── recommend.js      틈새 추천 (문장 읽기 → 코스 짜기 → 답변 표시)
│   ├── main.js           버튼·입력창에 동작 연결, 메인 화면 연출, 첫 화면 그리기
│   └── config.js         AI 서버 주소(AI_URL)를 적는 곳
├── data/
│   ├── categories.js     가게 종류(도자기, 향수 …)와 동행 조건
│   ├── regions.js        지역 목록과 대략적인 위치
│   └── shops.js          가게 정보 36곳
├── images/
│   ├── hero.svg          메인 화면 그림 (기차·구름 움직임 포함)
│   ├── icons/            종류별 아이콘
│   └── shops/            가게 사진을 넣는 폴더 (지금은 비어 있음)
├── cloudflare-worker/
│   └── worker.js         Cloudflare에 붙여 넣는 AI 추천 서버 코드
└── .vscode/
    └── extensions.json   VS Code가 Live Server 설치를 권하도록 하는 설정
```

## 실행 방법

### 가장 쉬운 방법
`index.html`을 더블클릭하면 브라우저에서 열립니다.

### VS Code에서 (권장)
1. VS Code에서 **파일 → 폴더 열기**로 `yeohaengteum` 폴더를 엽니다.
2. 오른쪽 아래에 "권장 확장을 설치하시겠습니까?"가 뜨면 **설치**를 누릅니다.
   안 뜨면 왼쪽 확장(네모 4개 아이콘)에서 **Live Server**를 검색해 설치합니다.
3. `index.html`을 열고 오른쪽 아래 **Go Live**를 누릅니다.
4. 브라우저가 열리고, 파일을 저장할 때마다 화면이 자동으로 새로 고쳐집니다.

휴대폰 화면으로 보려면 브라우저에서 `F12`를 누른 뒤 휴대폰 모양 아이콘을 누릅니다.

## 자주 하는 수정

### 가게 추가하기
`data/shops.js`에서 `{ ... }` 한 덩어리를 복사해 맨 아래에 붙이고 값을 바꿉니다.
각 값의 뜻은 파일 맨 위 설명에 있습니다. `id`는 다른 가게와 겹치면 안 됩니다.

### 가게 사진 넣기
1. 사진을 `images/shops/`에 넣습니다. (예: `ongi.jpg`)
2. `data/shops.js`에서 그 가게의 `"image": ""`를 `"image": "images/shops/ongi.jpg"`로 바꿉니다.

비워 두면 종류 아이콘이 대신 보입니다.

### 색·글씨체 바꾸기
`css/style.css` 맨 위 `:root { ... }` 안의 값을 바꾸면 전체에 반영됩니다.

### 지역·종류 추가하기
- 지역: `data/regions.js`에 한 줄 추가
- 종류: `data/categories.js`에 한 줄 추가하고 `images/icons/`에 아이콘 추가.
  추천 검색창이 알아듣게 하려면 `js/recommend.js`의 `CAT_KW`에도 단어를 추가합니다.

## 알아 둘 점

- **AI 추천은 `js/config.js`에 주소를 넣어야 켜집니다.** 비어 있거나 AI가 답하지 못하면 문장 속 단어를 찾는 간단한 규칙으로 추천합니다.
- **이동 시간은 어림값입니다.** `data/regions.js`의 대략적인 위치로 계산합니다. (`js/utils.js`의 `travel`)
- **여는 시간은 글자로만 보여 줍니다.** 지금 영업 중인지는 확인하지 않습니다.
- `index.html` 아래쪽의 `<script>` 순서(데이터 → 기능 → 시작)를 바꾸면 작동하지 않습니다.
- `css/style.css`는 한 줄에 규칙 하나씩 촘촘히 적혀 있습니다. VS Code에서 `Shift + Alt + F`를 누르면 보기 좋게 펼쳐집니다.

## 다음 단계

1. 실제 가게 5~10곳의 정보와 사진을 받아 `data/shops.js`를 채우기
2. 카카오맵 등 지도 서비스를 연결해 실제 위치와 이동 시간 쓰기
3. 가게 정보를 데이터베이스로 옮기고 관리자 화면 만들기
4. 서버를 두고 실제 AI 연결하기 (`js/recommend.js`의 `answer`를 교체)
5. 호스팅과 도메인을 마련해 공개하기

## AI 추천 켜기 (Cloudflare 무료)

1. cloudflare.com 에 무료로 가입합니다.
2. **Workers & Pages → Create application → Start with Hello World! → Get started**, 이름을 `yeohaengteum-ai`로 정하고 **Deploy**.
3. **Edit code**를 눌러 안의 코드를 모두 지우고 `cloudflare-worker/worker.js` 내용을 붙여 넣은 뒤 **Deploy**.
   붙여 넣기 전에 맨 위 `ALLOWED_ORIGINS`의 주소를 내 홈페이지 주소 앞부분으로 고칩니다.
4. Worker 화면의 **Bindings(바인딩) → Add binding → Workers AI**, 변수 이름(Variable name)을 `AI`로 적고 저장·배포합니다.
5. Worker 주소(`https://yeohaengteum-ai.○○○.workers.dev`)를 브라우저로 열어 `"ok":true`, `"ai":true`가 보이는지 확인합니다.
6. `js/config.js`의 `AI_URL`에 그 주소를 넣고 GitHub에 다시 올립니다.

무료 한도: Cloudflare Workers AI는 하루 10,000 뉴런까지 무료입니다. 한도를 넘으면 그날은 AI가 멈추고 간단 추천으로 바뀝니다. 유료 요금제에 가입하지 않는 한 요금은 나가지 않습니다.
