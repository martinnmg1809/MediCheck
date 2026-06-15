import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './form-new-password.html',
  styleUrls: ['./form-new-password.css'],
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule]
})
export class ResetPassFormComponent {

}