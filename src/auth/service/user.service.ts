import { ERROR_MESSAGES } from 'src/enum/responses.enum';
import { Repository } from 'typeorm/browser/repository/Repository.js';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../entity/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(createUserData) {
    const newUser = await this.repo.create({
      ...createUserData,
      identityVerification: {},
    });
    return this.repo.save(newUser);
  }

  async update(attr: Partial<User>, email?: string, id?: string) {
    let user;
    if (email) {
      user = await this.getByEmail(email);
    }

    if (id) {
      user = await this.getById(id);
    }

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    Object.assign(user, attr);
    return this.repo.save(user);
  }

  async getById(id: string) {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async getByEmail(email: string) {
    const user = await this.repo.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }
}
