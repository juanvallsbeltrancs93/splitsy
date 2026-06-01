import { SettlementsApi } from '@data/apis/settlements/settlementsApi';
import { SettlementsApiRepository } from '@data/settlement/SettlementsApiRepository';
import { Settlement } from '@domain/settlement/entities/Settlement';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';
import {
  givenCreateSettlementSuccess,
  givenListSettlementsSuccess,
  givenListSettlementsError,
} from './HttpSettlementRepository.fixtures';

const mockWebServer = new MockWebServer();
const GROUP_ID = 'grp-1';

function createRepo() {
  return new SettlementsApiRepository(new SettlementsApi(provideApi()));
}

describe('Tests on SettlementsApiRepository', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should return Settlement instance on createSettlement', async () => {
    givenCreateSettlementSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().createSettlement({
      groupId: GROUP_ID,
      body: {
        fromParticipantId: 'user-1',
        toParticipantId: 'user-2',
        amount: 50,
        date: '2024-01-15T00:00:00Z',
      },
    });
    expect(result).toBeInstanceOf(Settlement);
  });

  it('should return Settlement[] on listSettlements', async () => {
    givenListSettlementsSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().listSettlements({ groupId: GROUP_ID });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Settlement);
  });

  it('should return Settlement with correct amount on listSettlements', async () => {
    givenListSettlementsSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().listSettlements({ groupId: GROUP_ID });
    expect(result[0].amount).toBe(50);
  });

  it('should throw on listSettlements with 404', async () => {
    givenListSettlementsError(mockWebServer, GROUP_ID);
    await expect(createRepo().listSettlements({ groupId: GROUP_ID })).rejects.toThrow();
  });
});
