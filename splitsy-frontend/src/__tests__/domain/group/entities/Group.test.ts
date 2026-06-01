import { Group } from '@domain/group/entities/Group';
import type { GroupProps } from '@domain/group/entities/Group';

export const groupPropsMock: GroupProps = {
  id: '10',
  name: 'Test Group',
  participants: [
    { id: 'part-1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' },
    { id: 'part-2', displayName: 'Bob', type: 'REGISTERED', userId: 'user-2' },
    { id: 'part-3', displayName: 'Charlie', type: 'NON_REGISTERED' },
  ],
};

export const groupMock = Group.create(groupPropsMock);

describe('Tests on Group entity', () => {
  it('should create a Group with id, name, participants', () => {
    const group = Group.create(groupPropsMock);
    expect(group.id).toBe('10');
    expect(group.name).toBe('Test Group');
    expect(group.participants).toHaveLength(3);
    expect(group.participants[0].displayName).toBe('Alice');
  });

  it('should create a Group without id (generates empty string)', () => {
    const group = Group.create({ name: 'No Id', participants: [] });
    expect(group.id).toBeDefined();
  });

  it('should handle empty participants array', () => {
    const group = Group.create({ id: '5', name: 'Empty', participants: [] });
    expect(group.participants).toEqual([]);
  });

  it('should filter out inactive participants via activeParticipants', () => {
    const group = Group.create({
      id: '20',
      name: 'Mixed Group',
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED', isActive: true },
        { id: 'p2', displayName: 'Bob', type: 'REGISTERED', isActive: false },
        { id: 'p3', displayName: 'Charlie', type: 'NON_REGISTERED', isActive: true },
      ],
    });
    expect(group.activeParticipants).toHaveLength(2);
    expect(group.activeParticipants.map((p) => p.displayName)).toEqual(['Alice', 'Charlie']);
  });

  it('should include participants with undefined isActive as active by default', () => {
    const group = Group.create({
      id: '21',
      name: 'Default Group',
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED' },
        { id: 'p2', displayName: 'Bob', type: 'REGISTERED', isActive: false },
      ],
    });
    expect(group.activeParticipants).toHaveLength(1);
    expect(group.activeParticipants[0].displayName).toBe('Alice');
  });

  it('should return empty array when all participants are inactive', () => {
    const group = Group.create({
      id: '22',
      name: 'Inactive Group',
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED', isActive: false },
        { id: 'p2', displayName: 'Bob', type: 'REGISTERED', isActive: false },
      ],
    });
    expect(group.activeParticipants).toEqual([]);
  });
});
