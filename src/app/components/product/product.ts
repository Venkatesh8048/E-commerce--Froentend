import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ProductService } from '../../services/product-service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductModel } from '../../models/productModel';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingService } from '../../services/loading-service';
import { finalize } from 'rxjs';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product {

  dataSource: any[] = [];
  productForm: FormGroup
  isEditMode = false;
  selectedFile!: File
  selectedProductId: number | null = null;
  isModalOpen = false;
  category = ['Electronics', 'Fashion', 'Grocery', 'Shoes','Accessories', 'Stionary']
  isViewModalOpen = false;
  selectedProduct!: ProductModel;
  submitted = false;
  fileError = false;
  role: string = '';
  searchText: string = '';
  selectedCategory: string = 'All';
  filteredProducts: any[] = [];


  constructor(
    private productService: ProductService,
    private cartService:CartService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.productForm = fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.getAllProducts();
    if (isPlatformBrowser(this.platformId)) {
    this.role = localStorage.getItem('role') || 'ROLE_USER';
    console.log(this.role);
  }
  }

  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        this.dataSource = res;
        this.filteredProducts = res;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getImageUrl(fileName: string) {
    return this.productService.getImageUrl(fileName);
  }

  openModal() {
    this.isModalOpen = true;
    this.selectedProductId = null;
    this.productForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedProductId = null;
    this.productForm.reset();
    this.productForm.get('image')?.setValidators([Validators.required]);
    this.submitted = false;
  }


  editProduct(row: any) {
    this.isEditMode = true;
    this.selectedProductId = row.id;
    console.log(this.selectedProductId);
    console.log(this.isEditMode);

    this.isModalOpen = true;
    this.fileError = false;

    this.productForm.patchValue({
      name: row.name,
      price: row.price,
      description: row.description,
      category: row.category,
    });

    this.productForm.get('image')?.clearValidators();
    this.productForm.get('image')?.updateValueAndValidity();
  }

  deleteProduct(row: any) {

    console.log(row.id);


    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${row.name}?`,
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

        this.productService.deleteProduct(row.id).subscribe({
          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Product deleted successfully'
            });
            this.getAllProducts();
          },
          error: (err) => {
            console.error(err);
            Swal.fire(
              'Error!',
              'Something went wrong.',
              'error'
            );
          }
        });

      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;

      this.productForm.patchValue({
        image: file
      });

      if (this.selectedFile) {
        this.fileError = false;
      }


      this.productForm.get('image')?.updateValueAndValidity();
    }
  }

  // open/close menu
  toggleMenu(id: number) {
    this.selectedProductId = this.selectedProductId === id ? null : id;
  }

  onSubmitForm() {

    this.submitted = true;

    if (!this.selectedFile && !this.isEditMode) {
      this.fileError = true;
    } else {
      this.fileError = false;
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('price', String(this.productForm.get('price')?.value));
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('category', this.productForm.get('category')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    console.log(formData);


    const request$ =
      (this.isEditMode && this.selectedProductId !== null && this.selectedProductId !== undefined)
        ? this.productService.updateProduct(formData, this.selectedProductId)
        : this.productService.addProduct(formData);

    request$
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: () => {
          Swal.fire({
            title: this.isEditMode ? 'Edit Product' : 'Add Product',
            text: this.isEditMode
              ? 'Product successfully updated'
              : 'Product successfully added',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.finishSubmit();
            this.router.navigate(['/layout/product']);
            this.cdr.detectChanges();
          });
        },

        error: (err) => {
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Operation failed'
          });
        }
      });
  }


  finishSubmit() {
    this.closeModal();
    this.getAllProducts();
    this.isEditMode = false;
    this.selectedProductId = null;
    this.selectedFile = null as any;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterProducts(); 
  }

  filterProducts() {

    this.filteredProducts = this.dataSource.filter(product => {

      const matchesSearch =
        product.name.toLowerCase()
          .includes(this.searchText.toLowerCase());

      const matchesCategory =
        this.selectedCategory === 'All' ||
        product.category === this.selectedCategory;

      return matchesSearch && matchesCategory;

    });

  }

    isAdmin(): boolean {
    return this.role === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return this.role === 'ROLE_USER';
  }

  addToCart(productId: number) {
      const userId = Number(localStorage.getItem("userId"));
  
      this.loadingService.show();
  
      this.cartService.addToCart(productId, userId).subscribe({
        next: () => {
          this.loadingService.hide();
          Swal.fire({
            title: 'Success',
            text: 'Product added to cart',
            icon: 'success'
          });
        },
        error: () => {
          this.loadingService.hide();
          Swal.fire({
            title: 'Error',
            text: 'Failed to add product',
            icon: 'error'
          });
        }
      });
    }


}
