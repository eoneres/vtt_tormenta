import type { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<void>;
  update(user: UserEntity): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
