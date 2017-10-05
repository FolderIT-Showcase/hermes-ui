import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthenticationService} from './shared/services/authentication.service';
import {User} from './shared/domain/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {
  mostrarBarraLateral = false;

  constructor(private authenticationService: AuthenticationService,
              private cdRef: ChangeDetectorRef) {
    authenticationService.currentUser$.subscribe(user => this.onCurrentUserChanged(user));
  }

  ngOnInit() {
    this.mostrarBarraLateral = !!this.authenticationService.getCurrentUser();
  }

  ngAfterViewChecked() {
// explicit change detection to avoid "expression-has-changed-after-it-was-checked-error"
    this.cdRef.detectChanges();
  }

  private onCurrentUserChanged(user: User) {
    this.mostrarBarraLateral = !!user;
  }
}
