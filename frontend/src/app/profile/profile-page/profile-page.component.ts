import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  imports: [],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent {
  orders = [
    { id: 1, date: '12.04.2025', status: 'Доставлен', payment: 'Карта', amount: '1500 ₽' },
    // ...
  ];
}
