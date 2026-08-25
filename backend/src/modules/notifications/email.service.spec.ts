import { EmailService } from './email.service';

describe('EmailService', () => {
  function makeConfig(values: Record<string, any>) {
    return { get: (key: string, fallback?: any) => (key in values ? values[key] : fallback) } as any;
  }

  it('does not throw and stays in demo mode when SMTP_HOST is unset', async () => {
    const service = new EmailService(makeConfig({}));
    await expect(service.send('user@test.org', 'Sujet', 'Corps')).resolves.toBeUndefined();
  });

  it('builds a transporter when SMTP_HOST is provided', () => {
    const service = new EmailService(makeConfig({ SMTP_HOST: 'smtp.example.org', SMTP_PORT: 587 }));
    expect((service as any).transporter).toBeDefined();
  });
});
