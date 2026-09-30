import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [CommonModule,RouterModule],
  standalone:true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  private heroCarousel?: any;

 advertisements = [
  {
    image: '/accesories.png',
    alt: 'Premium accessories',
    title: 'Discover Your Style',
    subtitle: 'Explore our latest collection.'
  },
  {
    image: '/electronics.png',
     alt: 'Latest elecrtonics collection',
    title: 'Upgrade Your Lifestyle',
    subtitle: 'Find something special for every day.'
  },
  {
    image: '/fashion.png',
    alt: 'Latest fashion collection',
    title: 'Style Meets Comfort',
    subtitle: 'Shop the trends you love.'
  }
];

//  ngAfterViewInit(): void {
//     const carouselElement = document.getElementById('heroCarousel');

//     if (carouselElement) {
//       this.heroCarousel = new Carousel(carouselElement, {
//         interval: 3500,
//         ride: 'carousel',
//         pause: false,
//         wrap: true,
//         touch: true
//       });

//       this.heroCarousel.cycle();
//     }
//   }

//   ngOnDestroy(): void {
//     this.heroCarousel?.dispose();
//   }

  products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 199,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
  },
  {
    id: 2,
    name: 'Vintage Camera',
    category: 'Photography',
    price: 450,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1526170315876-ef1596573ef0'
  }
];
}
