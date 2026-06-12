import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../models/interfaces';


@Component({
selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrl: './styles/forgot-password.css', 
  standalone: true,
  imports: [FormsModule]
})
export class forgotComponent {
    credencial: Pick<User, 'email'> = {
            email: ''
        };


}