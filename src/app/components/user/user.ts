import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { LoadingService } from '../../services/loading-service';
import { UserModel } from '../../models/userModel';
import { finalize, map, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  standalone: true,
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {

  dataSource: any[] = [];
  filteredUsers: any[] = [];

  paginatedUsers: any[] = [];

  currentPage = 1;

  itemsPerPage = 5;

  totalPages = 0;

  totalPagesArray: number[] = [];

  isModalOpen = false;
  userForm: FormGroup;
  emailExists = false;
  userId!: number;
  roles: string[] = ["ROLE_ADMIN", "ROLE_USER"];
  isEditMode = false;
  selectedUserId: number | null = null;
  isViewModalOpen = false;
  selectedUser!: UserModel
  submitted = false;


  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {

    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email], [this.emailExistsValidator()]],
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

      return this.userService
        .checkEmailExists(control.value, this.userId)
        .pipe(
          map(exists => (exists ? { emailTaken: true } : null))
        );
    };
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
    this.isEditMode = false;
    this.selectedUserId = null;
    this.submitted = false;
  }


  ngOnInit() {
    this.getAllUsers();
  }
  // GET USERS
  getAllUsers() {

    this.userService.getAllUsers().subscribe({

      next: (res: any) => {

        console.log(res);

        // Store API data
        this.dataSource = res || [];

        // Copy data
        this.filteredUsers = [...this.dataSource];

        // First page load
        this.loadPageData();
        this.cdr.detectChanges();

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  // LOAD PAGE DATA
  loadPageData() {

    // Total Pages
    this.totalPages = Math.ceil(
      this.filteredUsers.length / this.itemsPerPage
    );

    // Page Numbers
    this.totalPagesArray = Array(this.totalPages)
      .fill(0)
      .map((x, i) => i + 1);

    // Start Index
    const start =
      (this.currentPage - 1) * this.itemsPerPage;

    // End Index
    const end =
      start + this.itemsPerPage;

    // Current Page Data
    this.paginatedUsers =
      this.filteredUsers.slice(start, end);

  }

  // SEARCH
  applyFilter(event: any) {

    const value =
      event.target.value.toLowerCase();

    this.filteredUsers =
      this.dataSource.filter((user: any) =>

        user.username.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.phone.toLowerCase().includes(value) ||
        user.address.toLowerCase().includes(value)

      );

    // Reset Page
    this.currentPage = 1;

    // Reload Table
    this.loadPageData();

  }

  // GO TO PAGE
  goToPage(page: number) {

    this.currentPage = page;

    this.loadPageData();

  }

  // NEXT PAGE
  nextPage() {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.loadPageData();

    }

  }

  // PREVIOUS PAGE
  previousPage() {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.loadPageData();

    }

  }

  onSubmitForm() {
    console.log(this.userForm.value);

    this.submitted = true;

    if (!this.userForm.valid) return;

    this.loadingService.show();

    const request$ = this.isEditMode && this.selectedUserId !== null
      ? this.userService.updateUser(this.userForm.value, this.selectedUserId)
      : this.userService.addUser(this.userForm.value);

    request$
      .pipe(
        finalize(() => this.loadingService.hide()) // 👈 always runs last
      )
      .subscribe({
        next: () => {
          Swal.fire({
            title: this.isEditMode ? 'Edit User' : 'Add User',
            text: this.isEditMode
              ? 'User successfully updated to system'
              : 'User successfully added to system',
            icon: 'success',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true
          }).then(() => {
            this.closeModal();
            this.getAllUsers();
            this.cdr.detectChanges();
          });
        },

        error: (err) => {
          console.error(err);
          Swal.fire('Error!', 'Something went wrong.', 'error');
        }
      });
  }

    editUser(row: any) {
    this.isEditMode = true;
    this.selectedUserId = row.id;
    this.isModalOpen = true;
    this.userId = row.id;

    this.userForm.patchValue({
      username: row.username,
      email: row.email,
      password: row.password,
      phone:row.phone,
      address:row.address,
      role: row.role
    });
  }

   deleteUser(row: any) {

    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${row.username}?`,
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

        this.userService.deleteUser(row.id).subscribe({
          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'User deleted successfully'
            });
            this.getAllUsers();
            this.cdr.detectChanges();
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

   openViewModel(row: any) {
    this.isViewModalOpen = true;

    this.selectedUser = {
      username: row.username,
      email: row.email,
      password: row.password,
      phone:row.phone,
      address:row.address,
      role: row.role
    };
  }

  closeViewModal() {
    this.isViewModalOpen = false;
  }

}




