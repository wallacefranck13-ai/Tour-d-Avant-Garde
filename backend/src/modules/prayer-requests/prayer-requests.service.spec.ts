import { PrayerRequestsService } from './prayer-requests.service';
import { PrayerRequestStatus } from './entities/prayer-request.entity';

describe('PrayerRequestsService', () => {
  function makeService() {
    const repo = {
      find: jest.fn(),
      findAndCount: jest.fn(),
      count: jest.fn(),
      create: jest.fn((data: any) => data),
      save: jest.fn(async (data: any) => ({ id: 'r1', ...data })),
      update: jest.fn(),
    } as any;
    return { service: new PrayerRequestsService(repo), repo };
  }

  it('findAll() sans page/limit renvoie un tableau brut (compatibilité)', async () => {
    const { service, repo } = makeService();
    repo.find.mockResolvedValue([{ id: 'r1' }]);
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(repo.findAndCount).not.toHaveBeenCalled();
  });

  it('findAll() avec page/limit renvoie un objet paginé', async () => {
    const { service, repo } = makeService();
    repo.findAndCount.mockResolvedValue([[{ id: 'r1' }], 42]);
    const result: any = await service.findAll({ page: 2, limit: 10 });
    expect(repo.findAndCount).toHaveBeenCalledWith({ order: { createdAt: 'DESC' }, skip: 10, take: 10 });
    expect(result.data).toEqual([{ id: 'r1' }]);
    expect(result.meta).toEqual({ total: 42, page: 2, limit: 10, totalPages: 5 });
  });

  it('creates a request by delegating to the repository', async () => {
    const { service, repo } = makeService();
    const result = await service.create({ subject: 'Guérison', authorName: 'Jean B.', phone: '+243900000006' });
    expect(repo.create).toHaveBeenCalledWith({ subject: 'Guérison', authorName: 'Jean B.', phone: '+243900000006' });
    expect(repo.save).toHaveBeenCalled();
    expect(result.id).toBe('r1');
  });

  it('updateStatus() delegates to the repository update', async () => {
    const { service, repo } = makeService();
    await service.updateStatus('r1', PrayerRequestStatus.ANSWERED);
    expect(repo.update).toHaveBeenCalledWith('r1', { status: PrayerRequestStatus.ANSWERED });
  });

  it('findStaleUnflagged() queries only NEW requests not yet flagged', async () => {
    const { service, repo } = makeService();
    repo.find.mockResolvedValue([]);
    await service.findStaleUnflagged(6);
    const [[query]] = repo.find.mock.calls;
    expect(query.where.status).toBe(PrayerRequestStatus.NEW);
    expect(query.where.followUpSent).toBe(false);
  });

  it('markFollowUpSent() flags the request so it is not notified twice', async () => {
    const { service, repo } = makeService();
    await service.markFollowUpSent('r1');
    expect(repo.update).toHaveBeenCalledWith('r1', { followUpSent: true });
  });

  it('countUrgentToday() only counts urgent requests created today', async () => {
    const { service, repo } = makeService();
    repo.count.mockResolvedValue(2);
    const count = await service.countUrgentToday();
    expect(count).toBe(2);
    const [[query]] = repo.count.mock.calls;
    expect(query.where.isUrgent).toBe(true);
  });
});
