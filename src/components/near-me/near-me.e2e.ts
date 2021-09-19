import { newE2EPage } from '@stencil/core/testing';

describe('near-me', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<near-me></near-me>');
    const element = await page.find('near-me');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
