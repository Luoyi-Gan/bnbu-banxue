import {describe,it,expect} from 'vitest'
import {mondayOf,offsetDate,timetableWeek,courseLanes,courseTone} from '../src/v2/timetableWeek'
import type {TimetableLesson} from '../shared/v2/timetableModel'
const lesson=(id:string,startTime='08:00',endTime='09:00'):TimetableLesson=>({id,name:'高等数学',weekday:1,startTime,endTime,location:'教 A101',teacher:'老师',weeks:'1–16周',period:'',note:'',needsReview:false})
describe('timetable week display',()=>{
  it('anchors week navigation to Shanghai calendar dates across year boundaries',()=>{
    expect(mondayOf('2027-01-03')).toBe('2026-12-28')
    expect(offsetDate('2026-12-28',7)).toBe('2027-01-04')
  })
  it('keeps past lessons in a selected week and excludes the reading week',()=>{
    const courses=timetableWeek([lesson('with:colon')],'2026-10-19','','bnbu-2026-s1')
    expect(courses).toHaveLength(1)
    expect(courses[0].lesson.id).toBe('with:colon')
    expect(courses[0].date).toBe('2026-10-19')
    expect(timetableWeek([lesson('1')],'2026-10-26','','bnbu-2026-s1')).toEqual([])
  })
  it('places overlapping lessons in separate lanes and allows touching intervals to reuse lanes',()=>{
    const items=timetableWeek([lesson('a','08:00','10:00'),lesson('b','09:00','11:00'),lesson('c','11:00','12:00')],'2026-10-19','','bnbu-2026-s1')
    const lanes=courseLanes(items)
    expect(lanes.map(item=>[item.lane,item.lanes])).toEqual([[0,2],[1,2],[0,1]])
    expect(courseTone('高等数学')).toBe(courseTone('高等数学'))
  })
})
