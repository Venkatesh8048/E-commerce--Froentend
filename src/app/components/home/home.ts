import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule,RouterModule],
  standalone:true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  advertisements = [
    {
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      title: 'Premium Watches',
      subtitle: 'Up to 20% off today',
      alt: 'Watch Ad'
    },
    {
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      title: 'Sonic Audio',
      subtitle: 'Experience true sound',
      alt: 'Headphones Ad'
    },
    {
      image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80',
      title: 'New Season Sneakers',
      subtitle: 'Explore the collection',
      alt: 'Sneakers Ad'
    }
  ];
}
