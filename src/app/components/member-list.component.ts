import { Component, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { asyncScheduler, catchError, Observable, scheduled, take } from 'rxjs';
import { Member } from '../models/member.model';
import { ThaiDatePipe } from '../pipe/thai-date.pipe';
import { AuthService } from '../services/auth.service';
import { MembersService } from '../services/members.service';
import { ToastService } from '../services/toast.service';
import { SharedModule } from '../shared/shared.module';
import { AddEditMemberComponent } from './add-edit-member.component';
import { MemberDetailComponent } from './member-detail.component';

@Component({
  selector: 'app-member-list',
  imports: [SharedModule, ThaiDatePipe],
  template: `
    @if (loading()) {
      <div class="loading-shade">
        <p-progressSpinner strokeWidth="4" ariaLabel="loading"/>
      </div>
    }

    @if ((member$ | async); as members) {
      <div class="table-container mt-3">
        <p-table
          #tb
          [value]="members"
          [paginator]="true"
          [rows]="10"
          [globalFilterFields]="[
                  'firstname',
                  'lastname',
                  'province',
                  'alive',
                ]"
          [rowHover]="true"
          [tableStyle]="{ 'min-width': '40rem' }" [responsiveLayout]="'scroll'">
          <ng-template #caption>
            <div class="flex items-center justify-between">
            <span>
								<p-button
                  [size]="'small'"
                  [disabled]="!admin()" (click)="openDialog(null)"
                  icon="pi pi-plus"/>
							</span>
              <span class="hidden md:block font-thasadith text-green-400 text-2xl ml-auto">
								รายชื่อสมาชิก
							</span>
              <p-iconfield iconPosition="left" styleClass="ml-auto">
                <p-inputicon>
                  <i class="pi pi-search"></i>
                </p-inputicon>

                <input
                  pInputText
                  [formControl]="searchControl"
                  pTooltip="ค้นหาตาม ชื่อ นามสกุล จังหวัด เสียชีวิต"
                  tooltipPosition="bottom"
                  placeholder="Search .."
                  type="text"
                  (input)="tb.filterGlobal(getValue($event), 'contains')"
                />
                @if (searchControl.value) {
                  <span id="icons" (click)="clear(tb)">
                    <i class="pi pi-times"></i>
                  </span>
                }
              </p-iconfield>
            </div>
          </ng-template>
          <ng-template #header>
            <tr>
              <th>#</th>
              <th>
                ยศ ชื่อ ชื่อสกุล
                <p-sortIcon field="firstname"></p-sortIcon>
              </th>
              <th>วันเกิด</th>
              <th>Action</th>
            </tr>
          </ng-template>
          <ng-template #body let-member let-i="rowIndex">
            <tr [ngClass]="{'row-status': member.alive == 'เสียชีวิตแล้ว'}">
              <td [ngClass]="{ isAlive: member.alive == 'เสียชีวิตแล้ว' }">
                {{ currentPage * rowsPerPage + i + 1 }}
              </td>
              <td [ngClass]="{ isAlive: member.alive == 'เสียชีวิตแล้ว' }">
                  <span>
                    {{ member.rank }}{{ truncateText(member.firstname, 15) }}
                    {{ truncateText(member.lastname, 15) }}
                  </span>
              </td>
              <td [ngClass]="{ isAlive: member.alive == 'เสียชีวิตแล้ว' }">
                {{ member.birthdate | thaiDate }}
              </td>
              <td>
                @if (admin()) {
                  <i class="pi pi-list mr-auto text-sky-300 hover:text-sky-400" (click)="memberDetail(member)"
                     pTooltip="รายละเอียด"></i>
                  <i
                    class="pi pi-pen-to-square mx-4 text-green-300 hover:text-green-400"
                    (click)="openDialog(member)" pTooltip="แก้ไขข้อมูล"
                  ></i>
                  <p-confirmPopup/>
                  <i
                    class="pi pi-trash text-orange-300 hover:text-orange-500"
                    (click)="confirm($event, member.id)" pTooltip="ลบข้อมูล"
                  ></i>
                } @else if (isMember()) {
                  <i class="pi pi-list mr-auto text-sky-300 hover:text-sky-400" (click)="memberDetail(member)"
                     pTooltip="รายละเอียด"></i>
                } @else {
                  <i class="pi pi-lock text-100"></i>
                }
              </td>
            </tr>
          </ng-template>
          <ng-template #footer>
            <td colspan="5">
              @if (!admin && !isMember) {
                <div>
                  <p-message severity="warn" icon="pi pi-exclamation-circle" styleClass="center-v italic">
                    Visitors are not allowed to view member details.
                  </p-message>
                </div>
              }
            </td>
          </ng-template>
        </p-table>
      </div>
    }
  `,
  styles: `
    .isAlive {
      color: #05c0f7 !important;
      font-weight: 500 !important;
    }

    .row-status {
      background-color: rgba(151, 151, 248, 0.05) !important;

      &:hover {
        background-color: rgba(151, 151, 248, 0.1) !important;
      }
    }

    #icons {
      position: absolute;
      right: 10px;
      top: 11px;
    }

    i {
      cursor: pointer;
    }
  `
})
export class MemberListComponent implements OnDestroy {
  authService = inject(AuthService);
  confirmService = inject(ConfirmationService);
  dialogService = inject(DialogService);
  membersService = inject(MembersService);
  messageService = inject(ToastService);
  destroyRef = inject(DestroyRef);

  searchControl = new FormControl();
  admin = signal(false);
  isMember = signal(false);
  loading = signal(true);
  members: Member[] = [];
  member$!: Observable<Member[]>;
  ref: DynamicDialogRef | undefined;

  currentPage = 0;
  rowsPerPage = 10;

  // members$ = this.membersService.getMembers();

  constructor() {
    this.chkRole();
    this.getMembers();
  }

  getMembers(): void {
    this.loading.set(true);

    this.member$ = this.membersService.getMembers().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((error: Error) => {
        this.messageService.showSuccess('Error', error.message);
        return scheduled([[]], asyncScheduler);
      }),
    );

    this.member$.subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  clear(table: Table) {
    table.clear();
    this.searchControl.reset();
  }

  chkRole() {
    this.authService.userProfile$.pipe(take(1)).subscribe((user: any) => {
      this.admin.set(user.role === 'admin' || user.role === 'manager');
      this.isMember.set(user.role === 'member');
    });
  }

  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  openDialog(member: any): void {
    let header = member ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มข้อมูลสมาชิก';

    this.ref = this.dialogService.open(AddEditMemberComponent, {
      header: header,
      data: member,
      width: '520px',
      contentStyle: {'max-height': '600px', overflow: 'auto'},
      breakpoints: {'960px': '520px'},
      closable: true,
      modal: true,
    });
  }

  memberDetail(member: Member): void {
    this.ref = this.dialogService.open(MemberDetailComponent, {
      header: 'ข้อมูลสมาชิก',
      data: member,
      width: '420px',
      contentStyle: {'max-height': '600px', overflow: 'auto'},
      breakpoints: {'960px': '420px'},
      closable: true,
      modal: true,
    });
  }

  confirm(event: Event, member: any) {
    this.confirmService.confirm({
      target: event.target as EventTarget,
      message: 'ต้องการลบรายการนี้ แน่ใจ?',
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'ไม่ใช่',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'ใช่',
        severity: 'warn'
      },
      accept: () => {
        this.membersService.deleteMember(member).subscribe({
          next: () => {
            this.messageService.showSuccess('Successfully', 'ลบข้อมูลเรียบร้อยแล้ว');
          },
          error: (error: any) => {
            this.messageService.showError('Error', error.message);
          },
          complete: () => {
          },
        });
      },
      reject: () => {
        this.messageService.showWarn('Information', 'ยกเลิกการลบแล้ว!');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.ref) this.ref.close();
  }
}
