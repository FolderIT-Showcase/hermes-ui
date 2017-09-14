import { Component, OnInit } from '@angular/core';
import {NavbarTitleService} from '../../shared/services/navbar-title.service';

@Component({
  selector: 'app-nota-debito',
  templateUrl: './nota-debito.component.html',
  styleUrls: ['./nota-debito.component.css']
})
export class NotaDebitoComponent implements OnInit {

  constructor(private navbarTitleService: NavbarTitleService) { }

  ngOnInit() {
    this.navbarTitleService.setTitle('Nota de Débito');
  }

}
