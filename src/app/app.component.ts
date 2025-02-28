import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';
import { FooterComponent } from './pages/footer.component';
import { HeaderComponent } from './pages/header.component';
import { AuthService } from './services/auth.service';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, HeaderComponent, FooterComponent],
  template: `
    <p-toast/>
    @if (currentUser() && emailVerify()) {
      <app-header/>
    }
    <div class="p-1">
      <router-outlet/>
    </div>
    @if (currentUser() && emailVerify()) {
      <app-footer/>
    }
  `,
  styles: `
    :host ::ng-deep .p-toast-message {
      font-family: 'Sarabun', sans-serif;
      font-size: 1.5rem;
      font-style: italic;
    }

    :host ::ng-deep .p-toast-detail {
      font-style: italic;
      font-size: 1.125rem;
    }

    :host ::ng-deep .p-toast-summary {
      font-size: 1.125rem !important;
    }
  `,
})
export class AppComponent {
  private authService: AuthService = inject(AuthService);
  private primeng: PrimeNG = inject(PrimeNG);
  private translate: TranslateService = inject(TranslateService);
  private isAuth: Auth = inject(Auth);

  emailVerify = signal(false);
  currentLang = signal('th');
  currentUser = this.authService.currentUser;

  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  resetTimer() {
    this.authService.resetTimer();
  }

  constructor() {
    /** Translate */
    this.translate.addLangs(['en', 'th']);
    this.translate.setDefaultLang('th');
    this.translate.use(this.currentLang());

    effect(() => {
      const lang = this.currentLang();
      this.translate.use(lang);
      this.translate.get(lang).subscribe((res) => {
        this.primeng.setTranslation(res);
      });
    });

    onAuthStateChanged(this.isAuth, (user) => {
      this.emailVerify.set(user?.emailVerified || false);
    });

  }

  /** เปลี่ยนภาษา */
  switchLanguage(lang: string) {
    this.currentLang.set(lang);
  }
}
