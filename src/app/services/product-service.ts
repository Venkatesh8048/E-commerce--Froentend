import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  
  private url = 'http://localhost:8080';
  private baseImageUrl = 'http://localhost:8080/images/';

  constructor(
    private http: HttpClient
  ) { }

  addProduct(data: FormData) {
    return this.http.post(`${this.url}/addProduct`, data, {
      withCredentials: true
    })
  }

  updateProduct(data:FormData,id:number){
     return this.http.put(`${this.url}/editProduct/${id}`, data, {
      withCredentials: true
    });
  }

  getAllProducts(){
    return this.http.get<any[]>(`${this.url}/getAllProducts`,{
      withCredentials:true
    })
  }

   getProductById(id:number){
    return this.http.get<any[]>(`${this.url}/getAllProducts/${id}`,{
      withCredentials:true
    })
  }

  deleteProduct(id:number){
    return this.http.delete(`${this.url}/deleteProduct/${id}`,{
      withCredentials:true
    })
  }

   getImageUrl(fileName: string) {
    return this.baseImageUrl + fileName;
  }
}
