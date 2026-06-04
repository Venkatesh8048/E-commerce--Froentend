import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import Swal from 'sweetalert2';
import { OrderService } from '../../services/order-service';
import { ProductService } from '../../services/product-service';
import { LoadingService } from '../../services/loading-service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { OrderModel } from '../../models/orderModel';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-order',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order {

  originalData: any[] = [];
  searchText: string = '';
  dataSource: any[] = [];
  isViewModalOpen = false;
  selectedOrder!: OrderModel
  status: string = 'Placed';
  isTrackOpen = false;
  role: string = '';
  filteredOrders: any[] = [];

  @ViewChild('invoiceContent', { static: false }) invoiceContent!: ElementRef;

  constructor(
    private orderService: OrderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private productService: ProductService,
    private loadingService: LoadingService,
    private router: Router,
    private cdr: ChangeDetectorRef,

  ) { }

  ngOnInit() {
    this.getOrder();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getOrder();
      });

    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role') || 'ROLE_USER';
      console.log(this.role);
    }
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.dataSource = this.originalData.filter(row => {
      return (
        row.product?.name?.toLowerCase().includes(filterValue) ||
        row.user?.username?.toLowerCase().includes(filterValue) ||
        row.totalPrice?.toString().includes(filterValue)
      );
    });
  }


  // getOrder() {
  //   if (!isPlatformBrowser(this.platformId)) {
  //     return;
  //   }
  //   const userId = Number(localStorage.getItem("userId"));
  //   console.log(userId);

  //   this.orderService.getAllOrders().subscribe({
  //     next: (res: any[]) => {

  //         const filterOrder = res.filter(u => u.user.id === userId)
  //         this.dataSource = new MatTableDataSource(filterOrder);
  //         this.dataSource.filterPredicate = (data: any, filter: string) => {
  //           const searchStr =
  //             data.id +
  //             data.product?.name +
  //             data.user?.name +
  //             data.quantity +
  //             data.totalPrice +
  //             data.orderDate;

  //           return searchStr.toLowerCase().includes(filter);
  //         };
  //         this.dataSource.paginator = this.paginator;
  //         this.dataSource.sort = this.sort;


  //     }
  //   })
  // }

  getOrder() {
    if (!isPlatformBrowser(this.platformId)) return;

    const userId = Number(localStorage.getItem("userId"));
    const role = localStorage.getItem("role");
    console.log(role);


    this.orderService.getAllOrders().subscribe({
      next: (res: any[]) => {

        console.log(res);


        const orders =
          role === "ROLE_ADMIN"
            ? res
            : res.filter(o => o.user.id === userId);

        this.dataSource = orders;
        this.filteredOrders = this.dataSource;
        this.cdr.detectChanges()

      }
    });
  }

  userRole = localStorage.getItem('role');

  goToDashboard() {
    const role = localStorage.getItem("role");
    if (role === "ROLE_ADMIN") {
      this.router.navigate(['/dashboard'])
    }
    else {
      this.router.navigate(['/userdashboard']);
    }

  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  openViewModel(row: any) {
    this.isViewModalOpen = true;

    this.selectedOrder = {
      product_name: row.product.name,
      user_name: row.user.username,
      totalPrice: row.totalAmount,
      quantity: row.quantity,
      order_date: row.orderDate,
      image: row.product.image,
      status: row.status
    };

    console.log(row);

  }

  closeViewModal() {
    this.isViewModalOpen = false;
  }

  getImageUrl(fileName: string) {
    return this.productService.getImageUrl(fileName);
  }

  cancelOrder(orderId: number) {

    console.log(orderId);


    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete this order?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true
    }).then((result) => {

      if (result.isConfirmed) {
        this.orderService.cancelOrder(orderId).subscribe({
          next: () => {
            this.loadingService.hide();
            this.getOrder();
            Swal.fire('Success', 'Order cancel successfully', 'success');
          },
          error: () => {
            this.loadingService.hide();
            Swal.fire('Error', 'Failed to order cancel', 'error');
          }

        })
      }
    })

  }


  trackOrder(order: any) {
    this.selectedOrder = order;
    this.isTrackOpen = true;
  }

  getStepIndex(status: string): number {
    if (status === 'PLACED') return 0;
    if (status === 'SHIPPED') return 1;
    if (status === 'OUT_FOR_DELIVERY') return 2;
    if (status === 'DELIVERED') return 3;
    return 0;
  }

  updateStatus(orderId: number, status: string, row: any) {

    this.orderService.updateOrderStatus(orderId, status).subscribe({

      next: (res) => {

        // instantly update UI
        row.status = status;
        this.cdr.detectChanges();

        console.log(res);

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  downloadInvoice() {

    const DATA = this.invoiceContent.nativeElement;

    html2canvas(DATA, {
      scale: 2,
      useCORS: true
    }).then(canvas => {

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

      pdf.save(`invoice_${this.selectedOrder.id}.pdf`);

    });

  }

  isAdmin(): boolean {
    return this.role === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return this.role === 'ROLE_USER';
  }

  filterOrders() {

  const value = this.searchText.toLowerCase();

  this.filteredOrders = this.dataSource.filter(order =>

    order.product?.name?.toLowerCase().includes(value) ||

    order.user?.username?.toLowerCase().includes(value) ||

    order.status?.toLowerCase().includes(value)

  );

}
}
