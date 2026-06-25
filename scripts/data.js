// Content data for the anniversary page.
//
// This is the file you edit to personalise the page — the anniversary date,
// messages, and photos. The behaviour lives in scripts/main.js; it reads
// START_DATE, MESSAGES and IMAGES from here. (Plain <script> tags share one
// global scope, and data.js loads first.)

"use strict";

// The day you got together (year, month-1, day). Months are 0-indexed: 11 = Dec.
const START_DATE = new Date(2025, 11, 6); // 6 Dec 2025

// A MESSAGES entry is either:
//   - a single line:  { text, from: "me" | "her", date?, time? }
//   - a group: an array of lines [ { text, from }, ... ] shown together as one
//     self-contained snippet. Only the first line carries date/time.
// `date` / `time` are optional (e.g. "24/06/2026", "11:47 PM"); when present
// they show under the text while the bubble is live, and hide once thrown.
const MESSAGES = [
  {
    text: "晚安",
    from: "her",
  },
  {
    text: "晚安",
    from: "me",
  },
  {
    text: "笨笨蛋😡",
    from: "her",
  },
  {
    text: "你才傻傻猪",
    from: "me",
  },
  {
    text: "早安",
    from: "me",
  },
  {
    text: "傻猪",
    from: "her",
  },
  {
    text: "晚安 傻猪",
    from: "me",
  },
  {
    text: "那22可以跟你約會嗎學長",
    from: "her",
  },
  {
    text: "我不管了！！！！！\n你的男媽媽上線了！！！！\n我還是無法冷靜！\n記得 檢查護照 錢包 水壺 衣服 行李 隨身包 補給 如果能就 online check in！！！\n\n然後 祝你一路順風👍👍\n\n然後有事記得說！至少我知道一下！知道嗎？好知道了。乖😋",
    from: "me",
  },
  {
    text: "愛你😡",
    from: "her",
  },
  {
    text: "晚安 愛你 麽麽",
    from: "me",
  },
  {
    text: "親親😡",
    from: "her",
  },
  {
    text: "早安😘",
    from: "me",
  },
  { text: "愛你", from: "me" },
  { text: "麽麽", from: "me" },
  { text: "晚安", from: "me" },
  { text: "woi 講愛我", from: "me" },
  { text: "晚安", from: "her" },
  { text: "不要", from: "her" },
  { text: "muanuamua", from: "me" },
  { text: "來 寶寶", from: "me" },
  { text: "angry kiss", from: "her" },
  { text: "親親", from: "her" },
  { text: "muamua", from: "me" },
  { text: "親親", from: "me" },
  { text: "親親", from: "her" },
  { text: "早安~", from: "me" },
  { text: "真的很愛你", from: "her" },
  { text: "就愛聽這句", from: "me" },
  { text: "愛你", from: "her" },
  { text: "愛你", from: "me" },
  { text: "应该没问题吧", from: "her" },
  { text: "看你而已", from: "her" },
  { text: "愛你too 麽麽", from: "me" },
  { text: "愛你", from: "her" },
  { text: "麽麽", from: "her" },
  { text: "老子很想你！！！", from: "me" },
  { text: "主要是想你了", from: "me" },
  { text: "我不戀腦更好啊 代表我感性上理性上都愛你", from: "me" },
  { text: "想要談戀愛了", from: "her" },
  { text: "muamua", from: "me" },
  { text: "愛你嗲", from: "me" },
  { text: "我知道我很可愛", from: "her" },
  { text: "大哥哥太厲害了", from: "her" },
  { text: "放開我寶寶！！", from: "me" },
  { text: "我只是以防萬一你睡死了 沒事就好", from: "me" },
  { text: "愛你", from: "her" },
  { text: "來 寶寶", from: "me" },
  { text: "angry kiss", from: "her" },
  { text: "angry kiss", from: "me" },
  { text: "muanuamua", from: "me" },
  { text: "你生氣我", from: "her" },
  { text: "甜点", from: "her" },
  { text: "我去接你", from: "me" },
  { text: "接你下班然后去买宵夜", from: "me" },
  { text: "送你回家", from: "me" },
  { text: "听起来很浪漫", from: "me" },
  { text: "好喔好喔", from: "her" },
  { text: "沒有你的照片😭", from: "me" },
  { text: "一起健身~~", from: "me" },
  { text: "5分鐘內到", from: "me" },
  { text: "沒到的話就等我", from: "me" },
  { text: "手機沒電了", from: "me" },
  { text: "那個鎖是假的 ❤️", from: "her" },
  { text: "我當場就哭了", from: "her" },
  { text: "大哥哥太厲害了", from: "me" },
  { text: "你的衣服真的是fish ball", from: "her" },
  { text: "誰穿誰fishball", from: "her" },
  { text: "你穿起來也fishball？", from: "me" },
  { text: "我要看看！", from: "me" },
  { text: "你在哪裡", from: "her" },
  { text: "你选吧", from: "her" },
  { text: "剛下課", from: "me" },
  { text: "到宿舍門口了", from: "me" },
  { text: "出來了", from: "me" },
  { text: "我6.之前會結束", from: "her" },
  { text: "我先去找你", from: "me" },
  { text: "你到了？", from: "her" },
  { text: "快了", from: "me" },
  { text: "準備出門", from: "her" },
  { text: "你不猜猜看哦", from: "me" },
  {
    text: "如果想跟我講理由的話 可以講喔。不想說的話我一樣愛你的。然後6周月快樂 我沒準備什麼禮物抱歉😔。之後補給你！",
    from: "me",
  },
  {
    text: "我頂不住了 先睡了哈。看你一眼終於能安心睡覺了。明天午餐再一起吃。",
    from: "me",
  },
  { text: "晚安 麼麼 愛你", from: "me" },
  { text: "愛你 麼麼", from: "me" },
  { text: "晚安咯 愛寶", from: "me" },
  { text: "晚安 ❤️", from: "her" },
  { text: "我還是有點擔心喔", from: "me" },
  { text: "看起來你心情不好", from: "me" },
  { text: "到你需要學AI的時候也可以放心了", from: "me" },
  { text: "今天的話會很晚嗯嗯 加油喔 別累壞了 (˘³˘)", from: "me" },
  {
    text: "莫名其妙醒來然後想到暑假可以去高雄玩。不要問我為什麼那麼突然",
    from: "me",
  },
  {
    text: "🐸",
    from: "her",
  },
  {
    text: "感觉非常好吃",
    from: "her",
  },
  {
    text: "睡着了？",
    from: "her",
  },
  {
    text: "那你要吃什么",
    from: "her",
  },
  {
    text: "一起吃还是",
    from: "her",
  },
  {
    text: "我在d24接你吧",
    from: "me",
  },
  {
    text: "我到門口了",
    from: "me",
  },
  {
    text: "等你吧 不急",
    from: "me",
  },
  {
    text: "🔫🔫🔫",
    from: "her",
  },
  {
    text: "我好生气",
    from: "her",
  },
  {
    text: "我好无聊",
    from: "her",
  },
  {
    text: "又有顏質 有腦袋 有身材 有錢 有努力 有志向",
    from: "me",
  },
  {
    text: "理我",
    from: "her",
  },
  {
    text: "(video vall) 56 mins 22 secs",
    from: "her",
  },
  {
    text: "我還以爲蛋糕你要等到正式官宣才給我哦",
    from: "her",
  },
  {
    text: "爲什麽談久了你變得很難撩啊",
    from: "her",
  },
  {
    text: "我生日有沒有什麽安排",
    from: "her",
  },
  {
    text: "那你要吃什么",
    from: "her",
  },
  {
    text: "你肚子饿吗",
    from: "her",
  },
  {
    text: "还好诶 只是想说有点迟了",
    from: "me",
  },
  {
    text: "bye-bye",
    from: "her",
  },
  {
    text: "有大瓜！！！！",
    from: "me",
  },
  {
    text: "zao o",
    from: "her",
  },
  {
    text: "爱你",
    from: "her",
  },
  {
    text: "😡",
    from: "her",
  },
  {
    text: "速速上",
    from: "her",
  },
  {
    text: "我覺得很炸裂 有人會這樣幹",
    from: "me",
  },
  {
    text: "看來是放下一個重擔了",
    from: "me",
  },
  {
    text: "感觉不用翘课",
    from: "her",
  },
  {
    text: "今天好多人不睡觉",
    from: "her",
  },
  {
    text: "什麼鬼。你搞的我現在好癢",
    from: "me",
  },
  {
    text: "阿😅",
    from: "me",
  },
  { text: "晚安 ❤️", from: "her" },
  {
    text: "寶兒，隨機打卡🤓\n愛妳唷～\n我不知道怎麼減少妳的壓力，但希望有那麼一小瞬間能讓妳知道，有人在偷偷替妳加油😘",
    from: "me",
  },
];

// Each image: { src, title?, date?, description? }  -> rendered as a polaroid.
// title / date / description are all optional; missing ones are simply omitted.
// Replace the picsum placeholders with "assets/images/your-photo.jpg" later.
const IMAGES = [
  {
    src: "assets/images/theatre.jpg",
    title: "第一次一起看电影（avatar3）",
    date: "06/02/2026",
  },
  {
    src: "assets/images/shopping.jpg",
    title: "一起牵手逛街",
    date: "30/01/2026",
  },
  {
    src: "assets/images/meusum.jpg",
    title: "一起逛博物馆",
    date: "22/02/2026",
  },
  {
    src: "assets/images/birthday.jpg",
    title: "为对方庆生日",
    date: "28/02/2026",
  },
  {
    src: "assets/images/ugly.jpg",
    title: "一起拍丑照",
    date: "17/01/2026",
  },
  {
    src: "assets/images/movie.jpg",
    title: "一起追剧",
    date: "09/02/2026",
  },
  {
    src: "assets/images/2playergame.jpg",
    title: "一起玩双人游戏",
    date: "25/12/2025",
  },
  {
    src: "assets/images/icecream.jpg",
    title: "一起吃雪糕",
    date: "12/12/2026",
  },
  {
    src: "assets/images/couple.jpg",
    title: "一起拍情侣照",
    date: "19/01/2026",
  },
  {
    src: "assets/images/valentine.jpg",
    title: "一起过情人节",
    date: "30/01/2026",
  },
  {
    src: "assets/images/boardgame.jpg",
    title: "一起玩桌游",
    date: "25/12/2025",
  },
  {
    src: "assets/images/showoff.jpg",
    title: "发朋友圈秀恩爱",
    date: "30/01/2026",
  },
  {
    src: "assets/images/mlsfirstdate.jpg",
    title: "mls first date",
    date: "30/01/2026",
  },
  {
    src: "assets/images/Xmasfirst.jpg",
    title: "Xmas first",
    date: "25/12/2025",
  },
  {
    src: "assets/images/confessagain.jpg",
    title: "再次表白喔",
    date: "17/01/2026",
  },
  {
    src: "assets/images/freezing.jpg",
    title: "冷死了",
    date: "09/01/2026",
  },
  {
    src: "assets/images/hug.jpg",
    title: "抱来抱去",
    date: "16/01/2026",
  },
  {
    src: "assets/images/cry.jpg",
    title: "哭哭猪",
    date: "28/12/2025",
  },
  {
    src: "assets/images/cat.jpg",
    title: "猫猫 再见微积分",
    date: "02/01/2026",
  },
  {
    src: "assets/images/wow.jpg",
    title: "wow手信",
    date: "12/01/2026",
  },
  {
    src: "assets/images/second.jpg",
    title: "一下飞机第二天就约会",
    date: "24/01/2026",
  },
  {
    src: "assets/images/classtogather.jpg",
    title: "一起上课哦",
    date: "18/12/2025",
  },
  {
    src: "assets/images/markettogather.jpg",
    title: "第一次一起逛夜市",
    date: "13/12/2025",
  },
  {
    src: "assets/images/shy.jpg",
    title: "娇羞哦",
    date: "12/02/2026",
  },
  {
    src: "assets/images/birthday2.jpg",
    title: "生日",
    date: "28/02/2026",
  },
  { src: "assets/images/avatarpaper.jpg" },
  { src: "assets/images/avatarpaper2.jpg" },
  { src: "assets/images/bottle.jpg" },
  { src: "assets/images/temple.jpg" },
  { src: "assets/images/crymouse.jpg" },
  { src: "assets/images/angrymouse.jpg" },
  { src: "assets/images/tietie.jpg" },
  { src: "assets/images/hall.jpg" },
  { src: "assets/images/fishball.jpg" },
  { src: "assets/images/cursingmouse.jpg" },
  { src: "assets/images/liwo.jpg" },
  { src: "assets/images/angryshark.jpg" },
  { src: "assets/images/image.jpg" },
  { src: "assets/images/dididi.jpg" },
  { src: "assets/images/tonkutsu.jpg" },
  { src: "assets/images/flower.jpg" },
  { src: "assets/images/avatardigital.jpg" },
  { src: "assets/images/son.jpg" },
  { src: "assets/images/son2.jpg" },
  { src: "assets/images/sonanddafei.jpg" },
  { src: "assets/images/dafei.jpg" },
];
