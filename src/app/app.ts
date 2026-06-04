import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './components/home/home';
import { Footer } from './components/footer/footer';
import { Sidebar } from './components/sidebar/sidebar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from './services/loading-service';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    Home,
    Footer,
    Sidebar,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    CommonModule,
  
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('e-commerce');

  loading$: any;
  progressValue = 0;
  bufferValue = 20;
  interval: any;

  constructor(private loadingService: LoadingService) {

    this.loading$ = this.loadingService.loading$;

    this.loading$.subscribe((isLoading: boolean) => {
      if (isLoading) this.startBuffer();
      else this.stopBuffer();
    });
  }

  startBuffer() {
    this.progressValue = 10;
    this.bufferValue = 30;

    this.interval = setInterval(() => {
      this.progressValue = Math.min(this.progressValue + 5, 100);
      this.bufferValue = Math.min(this.bufferValue + 8, 100);
    }, 200);
  }

  stopBuffer() {
    clearInterval(this.interval);
    this.progressValue = 100;
    this.bufferValue = 100;

    setTimeout(() => {
      this.progressValue = 0;
      this.bufferValue = 20;
    }, 300);
  }
}
