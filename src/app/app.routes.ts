import { Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['auth/login']);
const redirectLoggedInToHome = () =>
  redirectLoggedInTo(['/']);

export const routes: Routes = [
  {
    path: 'home',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./pages/home.component')
      .then(m => m.HomeComponent),
  },
  {
    path: 'auth',
    ...canActivate(redirectLoggedInToHome),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login.component')
          .then(m => m.LoginComponent),
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./auth/sign-up.component')
          .then(m => m.SignUpComponent),
      }
    ]
  },
  {
    path: 'members',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./components/member-list.component')
      .then(m => m.MemberListComponent),
  },
  {
    path: 'user',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./components/users-list.component')
      .then(m => m.UsersListComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];
