import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  login(data: any): Observable<any> {
    return this.http.post(`${AppConfig.apiBaseUrl}${AppConfig.auth.loginEndpoint}`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${AppConfig.apiBaseUrl}${AppConfig.auth.registerEndpoint}`, data);
  }

  refreshToken(token: string): Observable<any> {
    return this.http.post(`${AppConfig.apiBaseUrl}${AppConfig.auth.refreshTokenEndpoint}`, { refresh: token });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${AppConfig.apiBaseUrl}${AppConfig.auth.profileEndpoint}`);
  }

  storeTokens(access: string, refresh: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  clearTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
}
