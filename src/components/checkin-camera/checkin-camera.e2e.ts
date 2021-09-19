import { newE2EPage } from '@stencil/core/testing';

describe('checkin-camera', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<checkin-camera></checkin-camera>');
    const element = await page.find('checkin-camera');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
