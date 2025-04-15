import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';  // Импортируем конфиг
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  constructor(private http: HttpClient) {}

  getOrderHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${AppConfig.apiBaseUrl}${AppConfig.orders.historyEndpoint}`);
  }
}