import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { LoadingService } from '../../services/loading-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  standalone:true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  submitted:boolean = false;
  fieldTextType!: boolean;
  error = '';
  errorMessage: string = '';
  returnUrl!: string;
  isLoading:boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private loadingService:LoadingService
  ) { }

  ngOnInit(): void {

  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

 onSubmit() {
  this.submitted = true;
  this.errorMessage = '';

  if (this.loginForm.valid) {
     this.loadingService.show();
    this.authService.login(this.loginForm.value).subscribe({
      next: (res:any) => {
         this.loadingService.hide();
        console.log("res",res);
         const role = res.role;
          localStorage.setItem("user", JSON.stringify(res));
        localStorage.setItem("userId", res.userId);
        localStorage.setItem("role",res.role);
        localStorage.setItem("username",res.username);
        if(role == "ROLE_ADMIN"){
              this.router.navigate(['/layout']);
            }
            else{
              this.router.navigate(['/layout']);
            }
      },
      error: (err) => {
        this.loadingService.hide();
        console.log('LOGIN ERROR:', err);

        this.errorMessage =
          err?.error?.message || 'Invalid username or password';

        this.cd.markForCheck(); 
      }
    });
  }
}

}
