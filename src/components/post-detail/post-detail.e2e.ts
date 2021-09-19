import { newE2EPage } from '@stencil/core/testing';

describe('post-detail', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<post-detail></post-detail>');
    const element = await page.find('post-detail');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
