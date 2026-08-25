import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async health() {
    const database = await this.checkDatabase();
    return {
      status: database.ok ? 'ok' : 'degraded',
      service: 'tag-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      database,
    };
  }

  private async checkDatabase(): Promise<{ ok: boolean; driver: string; error?: string }> {
    const driver = this.dataSource.options.type;
    try {
      await this.dataSource.query('SELECT 1');
      return { ok: true, driver };
    } catch (err) {
      return { ok: false, driver, error: (err as Error).message };
    }
  }
}
