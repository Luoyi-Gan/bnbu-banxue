export function coffeeSlotStatus(input: {mine:boolean;cancelled:boolean;closed:boolean;enabled:boolean;started:boolean;full:boolean}) {
 if(input.mine) return '已预约'
 const availability=input.closed ? '时段已关闭' : !input.enabled ? '老师暂停预约' : input.started ? '已开始或结束' : input.full ? '已约满' : '可预约'
 return input.cancelled ? '预约已取消 · '+availability : availability
}
