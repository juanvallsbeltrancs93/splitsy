import type { Group } from "../entities/Group";
import type { UserBalance } from "../entities/UserBalance";
import type {
  AddParticipantParams,
  ClaimParticipantParams,
  CreateGroupParams,
  DeleteGroupParams,
  GetBalancesParams,
  GetGroupParams,
  ListGroupsParams,
  RemoveParticipantParams,
  UpdateGroupParams,
} from "./types";

export interface GroupRepository {
  listGroups(params: ListGroupsParams): Promise<Group[]>;
  createGroup(params: CreateGroupParams): Promise<Group>;
  getGroup(params: GetGroupParams): Promise<Group>;
  updateGroup(params: UpdateGroupParams): Promise<Group>;
  deleteGroup(params: DeleteGroupParams): Promise<void>;
  addParticipant(params: AddParticipantParams): Promise<Group>;
  removeParticipant(params: RemoveParticipantParams): Promise<Group>;
  getBalances(params: GetBalancesParams): Promise<UserBalance[]>;
  claimParticipant(params: ClaimParticipantParams): Promise<Group>;
}
