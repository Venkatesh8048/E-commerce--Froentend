import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import Swal from 'sweetalert2';
import { LoadingService } from '../../services/loading-service';
import { map, of } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  signupForm: FormGroup;
  submitted = false;
  roles = ["ROLE_USER"];
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.signupForm = fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email], [this.emailExistsValidator()]],
      password: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      address: ['', Validators.required],
      role: ['ROLE_USER', Validators.required]
    })
  }

    emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null);
      }

      return this.userService
        .checkEmailExists(control.value, this.userId)
        .pipe(
          map(exists => (exists ? { emailTaken: true } : null))
        );
    };
  }

  get f() {
    return this.signupForm.controls;
  }

  ngOninit() { }

  onSubmit() {
    this.submitted = true;
    if (this.signupForm.valid) {
      this.loadingService.show();
      this.userService.addUser(this.signupForm.value).subscribe({
        next: (res) => {
          this.loadingService.hide();
          console.log(res)
          Swal.fire({
            text: `You successfully register to system`,
            icon: 'success',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true
          }).then((result) => {
            this.router.navigate(['/login'])
          })
        },
        error: (err) => {
          this.loadingService.hide();
          Swal.fire(
            'Error!',
            'Something went wrong.',
            'error'
          );
        }
      })
    }

  }

}
