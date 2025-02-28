import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'thaiDate'
})
export class ThaiDatePipe implements PipeTransform {
  thaiDate!: any;
  inputDate: any;

  /**
   * เปลี่ยนรูปแบบวันที่เป็นแบบไทย ต้องตรวจสอบค่า (value) ที่ส่งเข้ามาว่าเป็นประเภทใด
   * แล้วจึงกำหนดค่า วัน เดือน ปี ต่อไป ที่ปิดคอมเมนต์ไว้คือเป็นการทดสอบนั่นเอง
   * */

  // @ts-ignore
  transform(value: Date | string | number | null | undefined, format?: string, timezone?: string, locale?: string): string | null {
  // @ts-ignore
  //   console.log('value ', value.toDate());
  //   console.log(typeof value);

    if (typeof value === 'object') {
      // @ts-ignore
      this.inputDate = new Date(value?.toDate());
      // @ts-ignore
      // this.thaiDate = new Date(value?.toDate());
      // this.thaiDate.setHours(this.thaiDate.getHours(), this.thaiDate.getMinutes(), this.thaiDate.getSeconds());
      // console.log(this.thaiDate);
    } else if (typeof value === 'string') {
      this.inputDate = new Date(value);
    }

    let ThaiDay = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    let sThaiDay = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.' ];
    let thaiMontn = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    let sthaiMontn = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    let dataDate = [
      this.inputDate?.getDay(), this.inputDate?.getDate(),
      this.inputDate?.getMonth(), this.inputDate?.getFullYear(),
      this.inputDate?.getHours(), this.inputDate?.getMinutes(),
      this.inputDate?.getSeconds()
    ];
    let outputDateFull = [
      'วัน' + ThaiDay[dataDate[0]],
      'ที่ ' + dataDate[1],
      'เดือน ' + thaiMontn[dataDate[2]],
      'พ.ศ. ' + (dataDate[3] + 543)
    ];
    let outputDateShort = [
      dataDate[1] + ' ',
      sthaiMontn[dataDate[2]],
      dataDate[3] + 543
    ];

    let outputDateMedium = [
      dataDate[1] + ' ',
      sthaiMontn[dataDate[2]],
      dataDate[3] + 543
    ];

    let outputDateMediumDay = [
      sThaiDay[dataDate[0]] + ' ',
      dataDate[1] + ' ',
      sthaiMontn[dataDate[2]],
      dataDate[3] + 543
    ];

    let outputDateMediumDayTime = [
      sThaiDay[dataDate[0]] + ' ',
      dataDate[1] + ' ',
      sthaiMontn[dataDate[2]],
      dataDate[3] + 543 + ' - ',
      dataDate[4] < 10 ? '0' + dataDate[4] + ':' : dataDate[4] + ':',
      dataDate[5] < 10 ? '0' + dataDate[5] + ':' : dataDate[5] + ':',
      dataDate[6] < 10 ? '0' + dataDate[6] : dataDate[6]
    ];

    let outputDateMediumTime = [
      dataDate[1] + ' ',
      sthaiMontn[dataDate[2]],
      dataDate[3] + 543 + ' - ',
      dataDate[4] < 10 ? '0' + dataDate[4] + ':' : dataDate[4] + ':',
      dataDate[5] < 10 ? '0' + dataDate[5] + ':' : dataDate[5] + ':',
      dataDate[6] < 10 ? '0' + dataDate[6] : dataDate[6]
    ];

    let returnDate: string ;
    returnDate = outputDateMedium.join('');

    if (format === 'full') {
      returnDate = outputDateFull.join('');
    }
    if (format === 'mediumt') {
      returnDate = outputDateMediumTime.join('');
    }
    if (format === 'medium') {
      returnDate = outputDateMedium.join('');
    }
    if (format === 'mediumd') {
      returnDate = outputDateMediumDay.join('');
    }
    if (format === 'mediumdt') {
      returnDate = outputDateMediumDayTime.join('');
    }
    if (format === 'short') {
      returnDate = outputDateShort.join('');
    }

    // console.log(returnDate);
    // console.log(dataDate[3]);
    // console.log('Time: ', dataDate[4] + ':' + dataDate[5] + ':' + dataDate[6]);
    return returnDate;
    // }
  }

}
