/* 가게 종류와 동행 조건
   - name : 화면에 보이는 이름
   - icon : 아이콘 그림 파일 위치
   - color: 카드 배경색
   종류를 늘리려면 여기에 한 줄 추가하고, images/icons 에 아이콘을 넣으세요.
   (도자기·향수·가죽·목공·카페 아이콘은 images/icons 에 그대로 남아 있어요.
    예) pottery: {"name": "도자기", "icon": "images/icons/pottery.svg", "color": "#FFD9C9"}) */
const CATS = {
  book: {"name": "책방", "icon": "images/icons/book.svg", "color": "#D3EBCF"},
  goods: {"name": "소품샵", "icon": "images/icons/goods.svg", "color": "#FFE7A6"},
  art: {"name": "공방·체험", "icon": "images/icons/art.svg", "color": "#FFD9C9"},
  cafe: {"name": "카페", "icon": "images/icons/cafe.svg", "color": "#D6ECF7"},
  culture: {"name": "영화·음악", "icon": "images/icons/culture.svg", "color": "#E9DDF6"}
};

/* 함께 가는 사람 조건 — 가게 정보(shops.js)의 kid / senior / wheel 과 짝을 이룹니다 */
const WITH = {
  kid: "아이와 함께",
  senior: "부모님과 함께",
  wheel: "휠체어 가능"
};
