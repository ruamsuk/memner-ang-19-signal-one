import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Member } from '../models/member.model';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-add-edit-member',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div>
      <div class="my-2">
        <hr class="h-px bg-gray-200 border-0"/>
      </div>
      <div class="flex flex-wrap flex-col justify-center">
        <form [formGroup]="memberForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <div>
              <label for="rank">ยศ</label>
              <p-autoComplete
                id="rank"
                formControlName="rank"
                [dropdown]="true"
                [suggestions]="filteredRanks"
                (completeMethod)="filterRanks($event)"
                appendTo="body"
                class="w-full"
                optionLabel="rank"
              >
              </p-autoComplete>
            </div>
            <div>
              <label for="firstname">ชื่อ</label>
              <input
                type="text"
                pInputText
                formControlName="firstname"
                class="w-full"
              />
            </div>
            <div>
              <label for="lastname">นามสกุล</label>
              <input
                type="text"
                pInputText
                formControlName="lastname"
                class="w-full"
              />
            </div>
            <div>
              <label for="birthdate">วันเดือนปีเกิด</label>
              <p-datePicker
                formControlName="birthdate"
                [iconDisplay]="'input'"
                [showIcon]="true"
                appendTo="body"
              />
            </div>
            <div class="col-span-2">
              <label for="address">ที่อยู่เลขที่ ถนน ตำบล</label>
              <input
                type="text"
                pInputText
                formControlName="address"
                class="w-full"
              />
            </div>
            <div>
              <label for="district">อำเภอ</label>
              <input
                type="text"
                pInputText
                formControlName="district"
                class="w-full"
              />
            </div>
            <div>
              <label for="province">จังหวัด</label>
              <input
                type="text"
                pInputText
                formControlName="province"
                class="w-full"
              />
            </div>
            <div>
              <label for="zip">รหัสไปรษณีย์</label>
              <input
                type="text"
                pInputText
                formControlName="zip"
                class="w-full"
              />
            </div>
            <div>
              <label for="phone">โทรศัพท์</label>
              <input
                type="text"
                pInputText
                formControlName="phone"
                class="w-full"
              />
            </div>
            <div></div>
          </div><!-- grid-cols-->

          <div class="flex justify-content-start mb-3">
            <p-toggleswitch formControlName="alive"/>
            <span
              [ngClass]="{
              isAlive: statusMessage == 'ยังมีชีวิต',
              status: statusMessage == 'เสียชีวิตแล้ว',
            }"
            >{{ statusMessage }}</span
            >
          </div>
        </form>
      </div>
      <div class="my-5">
        <hr class="h-px bg-gray-300 border-0"/>
      </div>
      <div class="field">
        <div class="flex mt-3">
          <p-button
            label="Cancel"
            severity="secondary"
            styleClass="w-full"
            class="w-full mr-2"
            (onClick)="closeDialog()"
          />
          <p-button
            label="Save"
            (onClick)="onSubmit()"
            [disabled]="memberForm.invalid"
            styleClass="w-full"
            class="w-full"
          />
        </div>
      </div>
    </div>
  `,
  styles: `
    label {
      margin-left: 0.5rem;
      color: #aaa9a9;
    }

    .isAlive {
      color: #78f153 !important;
      font-weight: 500 !important;
      font-family: 'Sarabun', sans-serif;
      margin-left: 0.5rem;
      margin-top: 0.1rem;
    }

    .status {
      color: #f63653 !important;
      font-weight: 500 !important;
      font-family: 'Sarabun', sans-serif;
      margin-left: 0.5rem;
      margin-top: 0.1rem;
    }
  `,
})
export class AddEditMemberComponent implements OnInit {
  message = inject(ToastService);
  userService = inject(UserService);
  ref = inject(DynamicDialogRef);
  memData = inject(DynamicDialogConfig);
  fb = inject(FormBuilder);
  //
  member!: Member;
  memberForm!: FormGroup;
  ranks: any[] = [
    {rank: 'น.อ.ร.'},
    {rank: 'ร.ต.อ.'},
    {rank: 'พ.ต.ต.'},
    {rank: 'พ.ต.ท.'},
    {rank: 'พ.ต.อ.'},
  ];
  filteredRanks: any;
  statusMessage: string = 'ยังมีชีวิต';
  alive: boolean = true;

  //
  constructor() {
    this.memberForm = this.fb.group({
      id: [null],
      rank: [''],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: [''],
      address: [''],
      district: [''],
      province: [''],
      role: [''],
      zip: [''],
      phone: [''],
      alive: [false], // เริ่มต้นเป็น false ซึ่งหมายถึง "ยังมีชีวิต"
    });
  }

  ngOnInit(): void {
    this.memberForm.get('alive')?.valueChanges.subscribe((value) => {
      this.statusMessage = value ? 'เสียชีวิตแล้ว' : 'ยังมีชีวิต';
    });
    if (this.memData.data) {
      const data = this.memData.data;
      this.memberForm.patchValue({
        ...data,
        birthdate: data.birthdate.toDate(),
        alive: data.alive == 'เสียชีวิตแล้ว',
      });
    }
  }

  filterRanks(event: any) {
    const query = event.query.toLowerCase();
    this.filteredRanks = this.ranks.filter((rank) =>
      rank.rank.toLowerCase().includes(query),
    );
  }

  onSubmit(): void {
    const formData = this.memberForm.value;
    const status = this.memberForm.value.alive ? 'เสียชีวิตแล้ว' : 'ยังมีชีวิต';
    const rank =
      typeof formData.rank === 'object' ? formData.rank.rank : formData.rank;
    const dummy = {
      ...formData,
      rank: rank,
      alive: status,
    };

    if (this.memData.data) {
      this.userService.updateMember(dummy).subscribe({
        next: () => this.message.showSuccess('Successfully', 'Updated SuccessFully'),
        error: (error: any) => this.message.showError('Error', error.message),
        complete: () => {
          this.closeDialog();
        },
      });
    } else {
      console.log(JSON.stringify(dummy, null, 2));
      this.userService
        .checkDuplicate(dummy.firstname, dummy.lastname)
        .subscribe({
          next: (isDuplicate: boolean) => {
            if (isDuplicate) {
              this.message.showWarn('Warning', 'มีข้อมูลนี้แล้วในระบบ');
            } else {
              this.userService.addMember(dummy).subscribe({
                next: () =>
                  this.message.showSuccess('Successfully', 'Add New Member Successfully'),
                error: (error: any) => this.message.showError('Error', error.message),
                complete: () => {
                  this.closeDialog();
                },
              });
            }
          },
          error: (err) => {
            console.error('Error checking for duplicate:', err.message);
            this.message.showError('Error', 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลซ้ำ');
          },
        });
    }

    // console.log(`Status: ${status}`);
    // console.log(JSON.stringify(formData, null, 2));
    // console.log(rank);
    // this.closeDialog();
  }

  closeDialog() {
    this.ref.close(true);
  }
}
