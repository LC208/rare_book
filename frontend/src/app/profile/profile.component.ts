import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { OrdersService } from '../orders/orders.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router'; 
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NzButtonModule,
    NzTableModule,
    NzCardModule,
    NzSpinModule,
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = {};
  orders: any[] = [];
  loadingUserData = true;
  loadingOrders = true;

  constructor(
    private authService: AuthService,
    private ordersService: OrdersService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (response) => {
        this.user = response;
        this.loadingUserData = false;
      },
      error: (err) => {
        this.message.error('Ошибка загрузки данных профиля');
        console.error(err);
        this.router.navigate(['/login']);
      },
    });

    this.ordersService.getOrderHistory().subscribe({
      next: (response) => {
        this.orders = response;
        this.loadingOrders = false;
      },
      error: (err) => {
        this.message.error('Ошибка загрузки истории заказов');
        // console.error(err);
      },
    });
  }

  onEditProfile() {
    console.log('Редактировать профиль');
  }
}
