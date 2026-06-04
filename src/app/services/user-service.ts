import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {

   private url = 'http://localhost:8080';

  constructor(
    private http:HttpClient
  ){}
  
  addUser(data:any){
    return this.http.post(`${this.url}/addUser`,data,{
      withCredentials:true
    })
  }

  checkEmailExists(email:string,userId:number){

    let params :any = {email:email};

     if (userId !== undefined && userId !== null) {
      params.userId = userId;
    }

     return this.http.get<boolean>(`${this.url}/email-exists`, {
      params: params
    });
  }

  getAllUsers(){
    return this.http.get<any[]>(`${this.url}/getAllUsers`,{
      withCredentials:true
    })
  }

  updateUser(data:any,id:number){
    return this.http.put(`${this.url}/updateUser/${id}`,data,{
      withCredentials:true
    })
  }

  deleteUser(id:number){
    return this.http.delete(`${this.url}/deleteUser/${id}`,{
      withCredentials:true
    })
  }
}
