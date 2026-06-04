import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

   private url = 'http://localhost:8080';
  

  constructor(
    private http:HttpClient
  ){
  }

  login(data:any){
    return this.http.post(`${this.url}/login`,data,{
      withCredentials:true
    })
  }
}
