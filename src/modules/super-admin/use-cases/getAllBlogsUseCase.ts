import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { BloggerRepository } from '../../blogger/blogger.repository';
import { BloggerQueryRepository } from '../../blogger/blogger.query.repository';

@Injectable()
export class GetAllBlogsUseCase {
  constructor(
    private bloggerRepository: BloggerRepository,
    private bloggerQueryRepository: BloggerQueryRepository,
  ) {}
  async execute() {
    return;
  }
}
