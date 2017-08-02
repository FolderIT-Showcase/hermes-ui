import { HermesUiLoginPage } from '../../page-objects/login/login.po';
import { browser } from 'protractor';

describe('Hermes-UI Web - Login', () => {
  let page: HermesUiLoginPage;

  beforeEach(() => {
    page = new HermesUiLoginPage();
    page.clearInputs();
    browser.get('/login');
  });

  // TEST: Login con datos incorrectos - se espera que muestre un Alert de error
  it('Should reject login', () => {
    page.getInputUsuario().sendKeys('usuariofalso');
    page.getInputContraseña().sendKeys('123456');
    page.clickIngresar();
    browser.waitForAngular();

    expect(page.getAlert().isDisplayed()).toBeTruthy();
  });
});
