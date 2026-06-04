import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private api = 'http://localhost:8080/payment';

  constructor(private http: HttpClient) { }

  createCheckout(totalAmount: number) {
    return this.http.post<any>(
      'http://localhost:8080/payment/create-checkout-session',
      { amount: totalAmount },
      {
        withCredentials: true
      }
    );
  }
}
