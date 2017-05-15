import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  ngOnInit() {
    $('.dropdown.keep-open').on({
      'shown.bs.dropdown': function() { this.closable = false; },
      'click':             function() { this.closable = true; },
      'hide.bs.dropdown':  function() { return this.closable; }
    });
  }

}
