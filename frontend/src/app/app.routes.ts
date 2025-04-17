import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component'; 
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './core/guards/auth.guard';
import { MainComponent } from './core/main/main.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [AuthGuard]},
    { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent },
    { path: '', component: MainComponent }
];
