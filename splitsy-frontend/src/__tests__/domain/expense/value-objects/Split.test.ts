import { Split } from '@domain/expense/value-objects/Split';

describe('Tests on Split value object', () => {
  it('should create with valid participantId and amount', () => {
    const split = Split.create('user-1', 50);
    expect(split.participantId).toBe('user-1');
    expect(split.amount).toBe(50);
  });

  it('should support numeric participantId', () => {
    const split = Split.create(1, 25);
    expect(split.participantId).toBe(1);
    expect(split.amount).toBe(25);
  });

  it('should throw when participantId is empty string', () => {
    expect(() => Split.create('', 10)).toThrow('ParticipantId missing in split');
  });

  it('should throw when amount is 0', () => {
    expect(() => Split.create('user-1', 0)).toThrow('Split amount must be greater than 0');
  });

  it('should throw when amount is negative', () => {
    expect(() => Split.create('user-1', -5)).toThrow('Split amount must be greater than 0');
  });

  it('should serialize to JSON', () => {
    const split = Split.create('user-1', 30);
    expect(split.toJSON()).toEqual({ participantId: 'user-1', amount: 30 });
  });
});
