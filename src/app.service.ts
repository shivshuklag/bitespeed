import { Injectable } from '@nestjs/common';
import { CreateIdentityDto } from './dto/create_identity.dto';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async createIdentity(createIdentityDto: CreateIdentityDto) {}
}
