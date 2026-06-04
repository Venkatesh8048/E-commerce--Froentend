import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user-service';
import { ProductService } from '../../services/product-service';
import { LoadingService } from '../../services/loading-service';
import { OrderService } from '../../services/order-service';
import { CartService } from '../../services/cart-service';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment-service';
import { OrderModel } from '../../models/orderModel';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {

  dataSource: any[] = [];
  searchText: string = '';
  originalData: any[] = [];

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private cartService: CartService,
    private loadingService: LoadingService,
    private orderService: OrderService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private paymentService: PaymentService

  ) { }

  ngOnInit() {
    this.getCartByUserId();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getCartByUserId();
      });
  }



  getCartByUserId() {
    // if (!isPlatformBrowser(this.platformId)) {
    //   return;
    // }

    const userId = Number(localStorage.getItem("userId"));
    if (!userId) return;
    this.cartService.getCartByUserId().subscribe({
      next: (res: any[]) => {
        const filterUser = res.filter(u => u.user.id === userId);
        setTimeout(() => {
       
            this.originalData = filterUser;
        this.dataSource = filterUser;
          this.cdr.detectChanges();
        });
        //this.originalData = filterUser;
        this.cdr.detectChanges();
      }
    })
  }

  // openViewModel(row: any) {
  //   this.isViewModalOpen = true;

  //   this.selectedCart = {
  //     product_name: row.product.name,
  //     user_name: row.user.username,
  //     totalPrice: row.totalPrice,
  //     quantity: row.quantity,
  //     image: row.product.image
  //   };
  // }

  // closeViewModal() {
  //   this.isViewModalOpen = false;
  // }

  getImageUrl(fileName: string) {
    return this.productService.getImageUrl(fileName);
  }

  removeProductQuantity(cartId: number) {
    // this.loadingService.show();

    this.cartService.removeProductQuantity(cartId).subscribe({
      next: () => {
        this.loadingService.hide();
        this.getCartByUserId(); // refresh table
        this.cdr.detectChanges();
        // Swal.fire('Success', 'Product quantity updated', 'success');
      },
      error: () => {
        this.loadingService.hide();
        Swal.fire('Error', 'Failed to update quantity', 'error');
      }
    });
  }

  addProductQuantity(cartId: number) {

    this.cartService.addProductQuantity(cartId).subscribe({
      next: () => {
        this.loadingService.hide();
        this.getCartByUserId();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingService.hide();
        Swal.fire('Error', 'Failed to update quantity', 'error');
      }
    });
  }

  deleteCart(cartId: number) {

    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete this cart?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true
    }).then((result) => {

      if (result.isConfirmed) {

        this.loadingService.show();

        this.cartService.removeCart(cartId).subscribe({
          next: () => {
            this.loadingService.hide();
            Swal.fire('Success', 'Cart deleted successfully', 'success');
            this.getCartByUserId();
          },
          error: () => {
            this.loadingService.hide();
            Swal.fire('Error', 'Failed to delete cart', 'error');
          }
        })
      }
    })

  }

  // placedOrder(cartId: number) {
  //   this.loadingService.show();

  //   this.orderService.placeOrder(cartId).subscribe({
  //     next: (res) => {
  //       console.log(res);

  //       this.loadingService.hide();
  //       Swal.fire('Success', 'Order placed successfully', 'success');
  //       this.getCartByUserId();
  //       this.router.navigate(['/layout/order'])
  //     },
  //     error: () => {
  //       this.loadingService.hide();
  //       Swal.fire('Error', 'Failed to placed order', 'error');
  //     }
  //   })
  // }

  placedOrder(cartId: number) {

    this.loadingService.show();

    // Create order first
    this.orderService.placeOrder(cartId).subscribe({

      next: (order: any) => {

        console.log(order.totalAmount);

        // Start Stripe payment
        this.paymentService.createCheckout(order.totalAmount).subscribe({

          next: (res) => {

            this.loadingService.hide();

            // Redirect to Stripe
            window.location.href = res.url;

          },

          error: () => {

            this.loadingService.hide();

            Swal.fire(
              'Error',
              'Payment session failed',
              'error'
            );
          }
        });

      },

      error: () => {

        this.loadingService.hide();

        Swal.fire(
          'Error',
          'Order creation failed',
          'error'
        );
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/userdashboard']);
  }

  searchProducts() {

  const search = this.searchText.toLowerCase().trim();

  if (!search) {

    this.dataSource = this.originalData;
    return;

  }

  this.dataSource = this.originalData.filter((item: any) =>

    item.product.name.toLowerCase().includes(search) ||

    item.user.username.toLowerCase().includes(search) ||

    item.product.id.toString().includes(search)

  );
}
}
