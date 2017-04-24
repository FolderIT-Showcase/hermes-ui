import {Component, OnInit} from '@angular/core';
import {User} from '../../domain/user';
import {UserService} from '../../service/user.service';
import {AlertService} from '../../service/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  currentUser: User;
  users: User[] = [];

  constructor(private userService: UserService, private alertService: AlertService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  deleteUser(id: number) {
    this.userService.delete(id).subscribe(() => {
      this.loadAllUsers();
    });
  }

  private loadAllUsers() {
    this.userService.getAll()
      .then(data => {
        this.users = data;
      })
      .catch(error => {
        this.alertService.error(error);
      });
  }

}
