import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { 
  MatProgressBarModule,
  MatButtonModule,
  MatInputModule,
  MatCardModule,
  MatCheckboxModule,
  MatSelectModule,
  MatIconModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { SessionsRoutes } from './sessions.routing';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { EmpresaService } from './empresa.service';
import { SigninService } from './signin/signin.service';
import { UsuarioService } from '../../shared/services/auth/usuario.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    FlexLayoutModule,
    RouterModule.forChild(SessionsRoutes)
  ],
  declarations: [ForgotPasswordComponent, LockscreenComponent, SigninComponent, SignupComponent, NotFoundComponent, ErrorComponent]
})
export class SessionsModule { }