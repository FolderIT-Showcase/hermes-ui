import { HermesUiPage } from './app.po';

describe('hermes-ui App', () => {
  let page: HermesUiPage;

  beforeEach(() => {
    page = new HermesUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
