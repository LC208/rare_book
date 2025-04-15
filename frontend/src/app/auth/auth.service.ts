import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

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
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
