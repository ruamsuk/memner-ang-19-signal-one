import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class CountAgeService {
  constructor() {}

  getAge(DayOfBirth: any) {
    if (!DayOfBirth) {
      return 'ไม่มีข้อมูลวันเกิด';
    }
    const setDayBirth = moment(DayOfBirth.toDate());
    const setNowDate = moment();

    // คำนวณอายุในปี
    const yearReal = setNowDate.diff(setDayBirth, 'years');
    setDayBirth.add(yearReal, 'years'); // ปรับ setDayBirth ไปยังวันเกิดล่าสุด

    // คำนวณจำนวนเดือนหลังจากปรับ setDayBirth
    const monthReal = setNowDate.diff(setDayBirth, 'months');
    setDayBirth.add(monthReal, 'months'); // ปรับ setDayBirth ไปยังเดือนเกิดล่าสุด

    // คำนวณจำนวนวันหลังจากปรับ setDayBirth
    const dayReal = setNowDate.diff(setDayBirth, 'days');

    return `${yearReal} ปี ${monthReal} เดือน ${dayReal} วัน`;
  }
}
