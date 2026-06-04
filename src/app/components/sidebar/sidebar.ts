import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule
  ],
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  role: string = '';
  username: string = '';
  // sidebar.component.ts

  isSidebarOpen = false;



  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

  }

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role') || 'ROLE_USER';
      this.username = localStorage.getItem('username') || "Admin";
      console.log(this.role);
      console.log(this.username);

    }
  }

  isAdmin(): boolean {
    return this.role === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return this.role === 'ROLE_USER';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

}
