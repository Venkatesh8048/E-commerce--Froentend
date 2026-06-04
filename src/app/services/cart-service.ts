import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {


  private url = 'http://localhost:8080';

  constructor(
    private http: HttpClient
  ) { }

  addToCart(productId: number, userId: number) {
    return this.http.post(
      `${this.url}/addToCart/${productId}?userId=${userId}`,
      {},
      { withCredentials: true }
    );
  }

  getCartByUserId() {
    return this.http.get<any[]>(`${this.url}/getCart`, {
      withCredentials: true
    })
  }

  removeProductQuantity(cartId: number) {
    return this.http.put(
      `${this.url}/removeCartItem/${cartId}`,
      {},
      { withCredentials: true }
    );
  }

  addProductQuantity(cartId: number) {
    return this.http.put(
      `${this.url}/addCartItem/${cartId}`,
      {},
      { withCredentials: true }
    );
  }

  removeCart(cartId: number) {
    return this.http.delete(`${this.url}/removeCart/${cartId}`, {
      withCredentials: true
    })
  }
}
