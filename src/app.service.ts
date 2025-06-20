import { Injectable } from '@nestjs/common';
import { CreateIdentityDto } from './dto/create_identity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createIdentity(createIdentityDto: CreateIdentityDto) {
    return await this.contactRepo.count();
  }
}
