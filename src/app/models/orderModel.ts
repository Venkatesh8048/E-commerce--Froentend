export interface OrderModel {
  id?: number;
  product_name: string;
  totalPrice: number;
  user_name?: string;
  quantity: number;
  order_date:Date,
  image:string;
  status:string
}