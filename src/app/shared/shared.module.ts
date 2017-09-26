import {DataTablesModule} from 'angular-datatables';
import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {AbmComponent} from './components/abm/abm.component';
import {ModalAbmComponent} from './components/abm/modal-abm/modal-abm.component';
import {FormFieldComponent} from './components/abm/form-field/form-field.component';
import {AlertComponent} from './components/alert/alert.component';
import {FastAbmComponent} from './components/fast-abm/fast-abm.component';
import {ProgressBarComponent} from './components/progress-bar/progress-bar.component';
import {TooltipModule, TypeaheadModule} from 'ngx-bootstrap';
import {MyDatePickerModule} from 'mydatepicker';
import {TextMaskModule} from 'angular2-text-mask';
import {UniquePipe} from './pipes/unique.pipe';
import {AsyncValidatorDirective} from './async.validator';
import { PuedeSalirComponent } from './components/puede-salir/puede-salir.component';
import {FastAbmDepositoComponent} from './components/fast-abm-deposito/fast-abm-deposito.component';

@NgModule({
  imports: [
    DataTablesModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    TypeaheadModule.forRoot(),
    TooltipModule.forRoot(),
    TextMaskModule,
    MyDatePickerModule
  ],
  declarations: [
    AbmComponent,
    AsyncValidatorDirective,
    ModalAbmComponent,
    FormFieldComponent,
    AlertComponent,
    FastAbmComponent,
    ProgressBarComponent,
    UniquePipe,
    PuedeSalirComponent,
    FastAbmDepositoComponent,
  ],
  exports: [
    AsyncValidatorDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    HttpModule,
    RouterModule,
    TypeaheadModule,
    TooltipModule,
    TextMaskModule,
    MyDatePickerModule,
    AbmComponent,
    ModalAbmComponent,
    FormFieldComponent,
    AlertComponent,
    FastAbmComponent,
    ProgressBarComponent,
    UniquePipe,
    PuedeSalirComponent,
    FastAbmDepositoComponent,
  ],
  entryComponents: [
    FastAbmDepositoComponent
  ]
})
export class SharedModule { }
