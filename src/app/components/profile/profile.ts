import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { UserModel } from '../../models/userModel';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, map, of } from 'rxjs';
import { UserService } from '../../services/user-service';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  selectedUser!: UserModel
  isModalOpen: boolean = false;
  selectedUserId: number | null = null;
  userForm: FormGroup;
  userId!: number;
  submitted = false;
  roles: string[] = ["ROLE_USER"];
  showPassword: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {

    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      address: ['', Validators.required],
      role: ['', Validators.required]
    })
  }


  emailExistsValidator(): AsyncValidatorFn {

    return (control: AbstractControl) => {

      if (!control.value) {
        return of(null);
      }

      // skip validation for same email
      if (control.value === this.selectedUser?.email) {
        return of(null);
      }

      return this.userService
        .checkEmailExists(control.value, this.userId)
        .pipe(
          map(exists => (exists ? { emailTaken: true } : null))
        );
    };
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      const data = localStorage.getItem('user');

      if (data) {
        this.selectedUser = JSON.parse(data);
      }

      console.log("data", this.selectedUser);
    }
  }

  logout() {
    console.log(localStorage);

    Swal.fire({
      title: 'Logout?',
      text: 'You will be signed out',
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout'
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  editUser(row: any) {
    console.log(row);

    this.selectedUserId = row.userId;
    this.isModalOpen = true;
    this.userId = row.userId;

    this.userForm.patchValue({
      username: row.username,
      email: row.email,
      password: row.password,
      phone: row.phone,
      address: row.address,
      role: row.role
    });

    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
  }

  openModal() {
    this.isModalOpen = true;
    this.selectedUserId = null;
    this.userForm.reset();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.userForm.reset();
    this.selectedUserId = null;

  }

  onSubmitForm() {

    this.submitted = true;

    if (!this.userForm.valid) return;

    if (this.selectedUserId == null) {

      Swal.fire(
        'Error',
        'User ID not found',
        'error'
      );

      return;
    }

    this.loadingService.show();

    this.userService
      .updateUser(this.userForm.value, this.selectedUserId)
      .pipe(
        finalize(() => this.loadingService.hide())
      )
      .subscribe({

        next: (response: any) => {

          // update localStorage
          const updatedUser = {
            ...this.selectedUser,
            ...this.userForm.value
          };

          localStorage.setItem(
            'user',
            JSON.stringify(updatedUser)
          );

          // update current UI object
          this.selectedUser = updatedUser;

          Swal.fire({
            title: 'Success',
            text: 'Profile updated successfully',
            icon: 'success'
          });

          this.closeModal();

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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
