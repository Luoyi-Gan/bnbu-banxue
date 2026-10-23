export function campusLifePrompt(now:number){
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',hourCycle:'h23'}).format(now))
 return hour<11?'帮我整理今天接下来的课程安排。':hour<14?'中午在校园里有哪些吃饭和休息的好去处？':hour<18?'今天还有哪些值得参加的校园活动？':'帮我看看明天的课程和近期可以预约的交流。'
}
