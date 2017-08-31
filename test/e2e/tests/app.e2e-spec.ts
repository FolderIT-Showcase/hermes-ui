import { HermesUiPage } from '../page-objects/app.po';

describe('hermes-ui App', () => {
  let page: HermesUiPage;

  beforeEach(() => {
    page = new HermesUiPage();
  });

  it('should match btn text', () => {
    page.navigateTo();
    expect(page.getTitle()).toEqual('Ingresar');
  });
});
