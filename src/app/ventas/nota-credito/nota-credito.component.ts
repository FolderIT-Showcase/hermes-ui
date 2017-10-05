import { Component, OnInit } from '@angular/core';
import {TitleService} from '../../shared/services/title.service';

@Component({
  selector: 'app-nota-credito',
  templateUrl: './nota-credito.component.html',
  styleUrls: ['./nota-credito.component.css']
})
export class NotaCreditoComponent implements OnInit {

  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Nota de Crédito');
  }

}
