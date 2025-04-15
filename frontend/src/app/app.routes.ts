import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component'; 
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [AuthGuard]},
    { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/profile', pathMatch: 'full' },
    { path: 'profile', component: ProfileComponent },
];
