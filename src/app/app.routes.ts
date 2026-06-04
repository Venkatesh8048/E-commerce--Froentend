import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Layout } from './components/layout/layout';
import { Dashboard } from './components/dashboard/dashboard';
import { User } from './components/user/user';
import { Product } from './components/product/product';
import { AddProduct } from './components/add-product/add-product';
import { Cart } from './components/cart/cart';
import { Order } from './components/order/order';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },

    {
        path: 'layout',
        component: Layout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            { path: 'user', component: User },
            { path: 'product', component: Product },
            { path: 'addProduct', component: AddProduct },
            {path:'cart',component:Cart},
            {path:'order',component:Order},
            {path:'profile',component:Profile},
            {
                path: 'addProduct/:id',
                component: AddProduct
            }
        ]
    },

    { path: '**', redirectTo: '' }
];
