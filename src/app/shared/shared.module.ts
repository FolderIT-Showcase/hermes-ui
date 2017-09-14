import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {AbmComponent} from './abm/abm.component';
import {ModalAbmComponent} from './abm/modal-abm/modal-abm.component';
import {FormFieldComponent} from './abm/form-field/form-field.component';
import {AlertComponent} from './alert/alert.component';
import {FastAbmComponent} from './fast-abm/fast-abm.component';
import {ProgressBarComponent} from './progress-bar/progress-bar.component';
import {TooltipModule, TypeaheadModule} from 'ngx-bootstrap';
import {MyDatePickerModule} from 'mydatepicker';
import {DataTablesModule} from 'angular-datatables';
import {TextMaskModule} from 'angular2-text-mask';
import {UniquePipe} from './pipes/unique.pipe';
import {AsyncValidatorDirective} from './async.validator';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    HttpModule,
    RouterModule,
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
  ]
})
export class SharedModule { }
