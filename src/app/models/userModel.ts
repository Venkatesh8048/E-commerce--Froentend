export interface UserModel {
  id?: number;
  username: string;
  email: string;
  password?: string;
  phone:string,
  address:string,
  role: string;
}