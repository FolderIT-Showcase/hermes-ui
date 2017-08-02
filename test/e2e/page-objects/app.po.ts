import { browser, element, by } from 'protractor';

export class HermesUiPage {
  navigateTo() {
    return browser.get('/login');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getTitle() {
    return element(by.xpath('/html/body/app-root/div/div/div/div/app-login/div/div/div/form/button[1]')).getText();
  }
}
