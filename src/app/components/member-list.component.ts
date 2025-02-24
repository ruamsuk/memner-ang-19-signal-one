import { Component, inject, resource } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MembersService } from '../services/members.service';
import { Member } from '../models/member.model';

@Component({
  selector: 'app-member-list',
  imports: [SharedModule],
  template: `
    @if (members.isLoading()) {
      <p>กำลังโหลดข้อมูล...</p>
    } @else if (members.error()) {
      <p class="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล!</p>
    } @else {
      <p-table [value]="members.value() ?? []">
        <ng-template pTemplate="header">
          <tr>
            <th>ชื่อ</th>
            <th>ที่อยู่</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-member>
          <tr>
            <td>{{ member.rank }}{{ member.firstname }} {{ member.lastname }}</td>
            <td>
              <span class="overflow-hidden text-ellipsis">
                {{ member.address }} {{ member.district }} {{ member.province }} {{ member.zip }}
                โทร. {{ member.phone }}
              </span>
            </td>
          </tr>
        </ng-template>
      </p-table>
    }

  `,
  styles: ``
})
export class MemberListComponent {
  membersService: MembersService = inject(MembersService);

  // members = resource({
  //   loader: async () => await this.membersService.getMembers(),
  // });
  members = resource<Member[], Error>({
    loader: async () => await this.membersService.getMembers(),
  });

}
