import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderModel } from '../models/orderModel';

@Injectable({
  providedIn: 'root',
})
export class OrderService {


  private url = 'http://localhost:8080';
  private baseImageUrl = 'http://localhost:8080/images/';

  constructor(private http: HttpClient) { }

  // placeOrder(cartId:number){
  //   return this.http.post(`${this.url}/placedOrder/${cartId}`,{
  //     withCredentials:true
  //   })
  // }

  placeOrder(cartId: number) {
    return this.http.post(
      `${this.url}/placedOrder/${cartId}`,
      {}, // request body (empty if not needed)
     
    );
  }

  getAllOrders() {
    return this.http.get<any[]>(`${this.url}/allOrder`, {
      withCredentials: true
    })
  }

  cancelOrder(orderId: number) {
    return this.http.put(`${this.url}/cancelOrder/${orderId}`, {
      withCredentials: true
    })
  }

  updateOrderStatus(orderId: number, status: string) {

    return this.http.put(
      `${this.url}/updateOrderStatus/${orderId}?status=${status}`,
      { withCredentials: true }
    );

  }
}
