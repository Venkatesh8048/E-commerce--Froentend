import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { ProductService } from '../../services/product-service';
import { OrderService } from '../../services/order-service';
import { filter } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';



@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective
  ],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  totalUsers: number = 0;
  totalProducts: number = 0;
  totalOrders: number = 0;
  role: string = '';

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();

      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.loadData();
        });
    }
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role') || 'ROLE_USER';
      console.log(this.role);
    }
  }

  getAllUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.totalUsers = res.length;
        this.cdr.detectChanges();
      }
    })
  }

  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        this.totalProducts = res.length;
        this.cdr.detectChanges();
      }
    })
  }

  getAllOrder() {
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.totalOrders = res.length;
        this.cdr.detectChanges();
      }
    })
  }

  loadData() {
    this.getAllUsers();
    this.getAllProducts();
    this.getAllOrder();
  }

  isAdmin(): boolean {
    return this.role === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return this.role === 'ROLE_USER';
  }



  salesChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        data: [12000, 18000, 15000, 22000, 30000, 28000, 36000],
        label: 'Sales',
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0d6efd'
      }
    ]
  };

  salesChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
}
