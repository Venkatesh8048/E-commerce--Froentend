import { ChangeDetectorRef, Component } from '@angular/core';
import { LoadingService } from '../../services/loading-service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {

  productForm: FormGroup
  isEditMode = false;
  selectedFile!: File
  submitted = false;
  fileError = false;
  selectedProductId: number | null = null;
  category = ['Electronics', 'Textile', 'Grocery', 'Accessories', 'Stionary']

  constructor(
    private loadingService: LoadingService,
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    //private cartService:Cartservice,
      private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', Validators.required]
    })
  }

  ngOnInit(){

  const id = Number(
  this.route.snapshot.paramMap.get('id')
);

  if(id){

    this.productService.getProductById(id).subscribe({

      next: (product:any) => {

        this.productForm.patchValue({

          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category

        });

        this.productForm.get('image')
        ?.clearValidators();

        this.productForm.get('image')
        ?.updateValueAndValidity();

      }

    });

  }

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

  onSubmitForm() {

    this.submitted = true;

    if (!this.selectedFile) {
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
    this.isEditMode = false;
    this.selectedProductId = null;
    this.selectedFile = null as any;
  }
}
