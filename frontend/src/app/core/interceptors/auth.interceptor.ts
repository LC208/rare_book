import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();
    
    if (accessToken) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return next.handle(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return this.refreshToken(req, next);
          }
          return throwError(() => new Error(error.message)); 
        })
      );
    }

    return next.handle(req);
  }

  private refreshToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      return this.authService.refreshToken(refreshToken).pipe(
        switchMap((tokens: any) => {
          localStorage.setItem('access_token', tokens.access);
          const clonedRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${tokens.access}`,
            },
          });

          return next.handle(clonedRequest);
        }),
        catchError((error) => {
          this.router.navigate(['/login']);
          return throwError(() => new Error('Failed to refresh token')); 
        })
      );
    } else {
      this.router.navigate(['/login']);
      return throwError(() => new Error('No refresh token'));
    }
  }
}