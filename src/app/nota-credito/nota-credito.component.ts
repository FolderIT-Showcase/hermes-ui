import { Component, OnInit } from '@angular/core';
import {NavbarTitleService} from '../../service/navbar-title.service';

@Component({
  selector: 'app-nota-credito',
  templateUrl: './nota-credito.component.html',
  styleUrls: ['./nota-credito.component.css']
})
export class NotaCreditoComponent implements OnInit {

  constructor(private navbarTitleService: NavbarTitleService) { }

  ngOnInit() {
    this.navbarTitleService.setTitle('Nota de Crédito');
  }

}
