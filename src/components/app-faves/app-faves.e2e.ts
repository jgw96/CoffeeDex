import { newE2EPage } from '@stencil/core/testing';

describe('app-faves', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-faves></app-faves>');
    const element = await page.find('app-faves');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
