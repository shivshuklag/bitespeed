import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateIdentityDto } from './dto/create_identity.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('identity')
  async createIdentity(@Body() createIdentityDto: CreateIdentityDto) {
    return await this.appService.createIdentity(createIdentityDto);
  }
}
