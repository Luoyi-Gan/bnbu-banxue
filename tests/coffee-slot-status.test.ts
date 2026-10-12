import {it,expect} from 'vitest';
import {coffeeSlotStatus} from '../src/v2/coffeeSlotStatus';
it('区分本人取消、教师关闭和真实约满，不阻止取消后重新预约',()=>{
 const base={mine:false,cancelled:false,closed:false,enabled:true,started:false,full:false};
 expect(coffeeSlotStatus({...base,cancelled:true,closed:true})).toBe('预约已取消 · 时段已关闭');
 expect(coffeeSlotStatus({...base,closed:true})).toBe('时段已关闭');
 expect(coffeeSlotStatus({...base,full:true})).toBe('已约满');
 expect(coffeeSlotStatus({...base,cancelled:true})).toBe('预约已取消 · 可预约');
 expect(coffeeSlotStatus({...base,cancelled:true,mine:true})).toBe('已预约');
 expect(coffeeSlotStatus({...base,enabled:false})).toBe('老师暂停预约');
 expect(coffeeSlotStatus({...base,started:true})).toBe('已开始或结束');
});
