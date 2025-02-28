import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { SharedModule } from '../shared/shared.module';
import { ForgotPasswordComponent } from './forgot-password.component';


@Component({
  selector: 'app-login',
  imports: [
    SharedModule,
    RouterLink,
    NgClass,
    NgOptimizedImage,
  ],
  template: `
    <!--, background: '#1f2937' -->
    <div class="center h-screen gap-y-5">
      <div>
        <form [formGroup]="loginForm" (ngSubmit)="login()">
          <p-card [style]="{width:'360px'}" styleClass="drop-shadow-md">
            <div class="flex justify-center">
              <img ngSrc="/images/primeng.png" alt="logo" priority height="51" width="48">
            </div>
            <div class="flex justify-center text-900 text-2xl font-medium my-5">
              Account App.
            </div>
            <ng-template pTemplate="p-card-content">
              <div class="field my-2">
                @if (isEmailValid) {
                  <label [ngClass]="{'p-error': isEmailValid}" class="mb-2">Email</label>
                } @else {
                  <label>Email</label>
                }
                <input
                  type="email"
                  pInputText
                  formControlName="email"
                  name="email"
                  id="email"
                  class="w-full {{ isEmailValid ? 'ng-invalid ng-dirty' : '' }} mt-1"
                  autocomplete="email"/>
                @if (isEmailValid; as message) {
                  <small class="block p-error pl-2 py-2 font-semibold">
                    {{ message }}
                  </small>
                }
              </div>
              <div class="field my-3">
                @if (isValidPassword) {
                  <label [ngClass]="{'p-error': isValidPassword}">Password</label>
                } @else {
                  <label>Password</label>
                }
                <p-password
                  class="w-full {{
                    isValidPassword ? 'ng-invalid ng-dirty' : ''
                  }} mt-2"
                  [feedback]="false"
                  formControlName="password"
                  styleClass="p-password p-component p-inputwrapper p-input-icon-right"
                  [style]="{ width: '100%' }"
                  [inputStyle]="{ width: '100%' }"
                  [toggleMask]="true"
                  autocomplete="password"
                />
                @if (isValidPassword; as messages) {
                  <small class="block p-error pl-2 font-semibold">
                    {{ messages }}
                  </small>
                }
                <div class="my-2">
                  <span
                    class="sarabun text-sky-400 italic cursor-pointer hover:text-sky-300 hover:underline underline-offset-2"
                    (click)="forgotPassword()"
                  >
                    ลืมรหัสผ่าน
                  </span>
                </div>
              </div>
            </ng-template>
            <ng-template pTemplate="footer">
              <div class="flex items-start justify-center">
                @if (loading()) {
                  <button type="button"
                          class="w-full inline-flex justify-center items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-400 hover:bg-indigo-300 transition ease-in-out duration-150 cursor-not-allowed"
                  >
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </button>
                } @else {
                  <button type="submit" [disabled]="loginForm.invalid"
                          [ngClass]="{
                          'btn-disabled': loginForm.invalid,
                          'btn-enabled': !loginForm.invalid
                          }"
                          class="w-full inline-flex justify-center items-center px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-white bg-indigo-400 transition ease-in-out duration-150">
                    Login
                  </button>
                }
              </div>
              <div class="relative flex items-center py-1">
                <div class="flex-grow h-px bg-gray-400"></div>
                <span class="flex-shrink px-4 text-gray-500">OR</span>
                <div class="flex-grow h-px bg-gray-400"></div>
              </div>
              <div class="grid grid-cols-1">
                <p-button
                  label="SignIn With Google"
                  icon="pi pi-google"
                  [loading]="loading()"
                  severity="secondary"
                  styleClass="w-full" (click)="googleSignIn()"/>
              </div>
              <div class="mt-2 mg-5 ml-2">
                Not a member?
                <a routerLink="/auth/sign-up" class="cursor-pointer">
                  <span class="text-blue-500 hover:underline underline-offset-2 hover:text-blue-400">Register</span>
                </a>
              </div>
            </ng-template>
          </p-card>
        </form>
      </div>
    </div>
  `,
  styles: `

  `
})
export class LoginComponent {
  authService = inject(AuthService);
  dialogService = inject(DialogService);
  message = inject(ToastService);
  router = inject(Router);
  ref: DynamicDialogRef | undefined;
  loading = signal(false);
  private formBuilder = inject(FormBuilder);

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get isEmailValid(): string | boolean {
    const control = this.loginForm.get('email');
    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid email';
    }

    return false;
  }

  get isValidPassword(): string | boolean {
    const control = this.loginForm.get('password');
    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      if (control.hasError('required')) {
        return 'This field is required';
      } else if (control.hasError('minlength')) {
        return 'Password must be at least 8 characters long';
      } else {
        return 'Enter a valid password';
      }
    }

    return false;
  }

  login() {
    const {email, password} = this.loginForm.value;

    if (!this.loginForm.valid || !email || !password) {
      return;
    }

    this.loading.set(true);

    this.authService.login(email, password).subscribe({
      next: async (userCredential) => {
        const user = userCredential.user;

        if (!user.emailVerified) {
          this.message.showWarn('Warning', 'Please verify your email before logging in');
          this.loading.set(false);
          await this.router.navigateByUrl('/auth/login');
          return;
        }
        const role = this.authService.getRoles();

        const userProfile = await this.authService.getUserProfile(user.uid);
        if (userProfile) {
          const userData = {
            displayName: user.displayName,
            email: user.email,
            // photoURL: user.photoURL,
            role: role,
            ...userProfile,
          };
          localStorage.setItem('user', JSON.stringify(userData));
          this.message.showSuccess('Success', 'Login successful');
        } else {
          this.message.showError('Error', 'User not found.');
        }
      },
      error: (error) => {
        this.setTimer();
        this.message.showError('Error', `${error.message}`);
      },
      complete: () => {
        this.setTimer();
        this.router.navigateByUrl('/home').then();
      }
    });
  }

  setTimer() {
    setTimeout(() => {
      this.loading.set(false);
    }, 100);
  }

  forgotPassword() {
    this.ref = this.dialogService.open(ForgotPasswordComponent, {
      header: 'Forgot Password',
      width: '360px',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '360px',
        '640px': '360px',
      },
      closable: true,
    });
  }

  googleSignIn() {
    this.authService.googleSignIn().then(
      () => {
        this.message.showSuccess(
          'Success',
          'Google Login successful',
        );
        this.router.navigateByUrl('/home').then();
      }).catch((error) => {
      console.error(error);
    });

  }

}
