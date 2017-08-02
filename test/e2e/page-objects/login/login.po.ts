import { element, by } from 'protractor';

export class HermesUiLoginPage {

  private inputUsuario = element(by.name('form-username'));
  private inputPw = element(by.name('form-password'));
  private btnIngresar = element(by.xpath('/html/body/app-root/div/div/div/div/app-login/div/div/div/form/button[1]'));
  private btnRecuperar = element(by.xpath('/html/body/app-root/div/div/div/div/app-login/div/div/div/form/button[2]'));
  private alert = element(by.xpath('/html/body/app-root/div/div/div/div/app-alert/div'));

  getInputUsuario() {
    return this.inputUsuario;
  }

  getInputContraseña() {
    return this.inputPw;
  }

  getBotonIngresar() {
    return this.btnIngresar;
  }

  getBotonRecuperar() {
    return this.btnRecuperar;
  }

  getAlert() {
    return this.alert;
  }

  clearInputs() {
    this.inputUsuario.clear();
    this.inputPw.clear();
  }

  clickIngresar() {
    this.btnIngresar.click();
    // return new HomePage();......
  }
}
