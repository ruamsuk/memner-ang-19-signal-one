import { Component, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, Observable, take } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { UsersService } from '../services/users.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-users-list',
  imports: [
    SharedModule
  ],
  template: `
    @if (loading()) {
      <div class="loading-shade">
        <p-progressSpinner strokeWidth="4" ariaLabel="loading"/>
      </div>
    }
    @if (!admin()) {
      <div class="flex items-center justify-center h-45 w-full bg-red-400 text-white text-5xl font-bold rounded-md">
        Not Authorized
      </div>
    } @else {
      @if ((users$ | async); as users) {
        <div class="table-container mt-3">
          <p-table
            [value]="users"
            [selectionMode]="'single'"
            [(selection)]="selectedUser"
            [dataKey]="'uid'"
            (onRowSelect)="onRowSelected($event)"
            (onRowUnselect)="onRowUnSelected($event)">
            <ng-template #caption>
              <div class="grid grid-cols-1">
                <p class="hidden md:block text-center text-lg md:text-xl text-sky-500">
                  Change User Roles
                </p>
                <p class="hidden md:block text-center">
                  Click on row to automatic change role, Click again to role back
                </p>
              </div>
            </ng-template>
            <ng-template #header>
              <tr>
                <th>Email</th>
                <th>displayName</th>
                <th>Role</th>
              </tr>
            </ng-template>
            <ng-template #body let-user let-i="rowIndex">
              <tr [pSelectableRow]="user">
                @if (user.role != 'admin' && user.role != 'manager') {
                  <td>{{ user.email }}</td>
                  <td>{{ user.displayName }}</td>
                  <td>{{ user.role }}</td>
                }
              </tr>
            </ng-template>
          </p-table>
        </div>
      }
    }

  `,
  styles: ``
})
export class UsersListComponent implements OnDestroy {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private userService: UsersService = inject(UsersService);
  private toastService = inject(ToastService);

  ref: DynamicDialogRef | undefined;
  selectedUser!: User;
  users$: Observable<User[]> | undefined;
  user!: User;
  loading = signal<boolean>(true);
  isMember = signal<boolean>(false);
  admin = signal<boolean>(false);

  constructor() {
    this.chkRole();
    this.getUsers();
  }

  getUsers() {
    this.loading.set(true);

    this.users$ = this.userService.getAllUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: Error) => {
          this.toastService.showError('Error', error.message);
          return [];
        }),
      );
    this.users$.subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  chkRole() {
    this.authService.userProfile$.pipe(take(1)).subscribe((user: any) => {
      this.admin.set(user.role === 'admin' || user.role === 'manager');
      this.isMember.set(user.role === 'member');
    });
  }

  ngOnDestroy(): void {
    if (this.ref) this.ref.destroy();
  }

  onRowSelected(event: any) {
    this.userService.updateRole(event.data).subscribe(() => {
      this.toastService.showInfo('Change User role', `User role has Change to 'member'`);
    });
  }

  onRowUnSelected(event: any) {
    this.userService.reRole(event.data).subscribe(() => {
      this.toastService.showInfo('Change User role', `User role back to 'user'`);
    });
  }
}
