import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from './repositories/mongodb/comments.query.repository';
import { LikeInputDto } from '../likes/dto/create-like.dto';
import { CommentInputDto } from './dto/create-comment.dto';

import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { CommentsService } from './comments.service';
import { LikesQueryRepository } from '../likes/repositories/mongodb/likes.query.repository';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
import { CommandBus } from '@nestjs/cqrs';
import {
  CreateLikeStatusUseCase,
  CreateLikeStatusUseCaseCommand,
} from '../likes/use-cases/postgresql/createLikeStatusSqlUseCase';
import { CreateCommentInPostSqlUseCaseCommand } from './use-cases/postgresql/createCommentInPostSqlUseCase';
import { CommentsQuerySqlRepository } from './repositories/postgresql/comments.query.sql.repository';
import { LikesQuerySqlRepository } from '../likes/repositories/postgresql/likes.query.sql.repository';
import { isBlogExist } from '../../helpers/custom-validators/custom.validator';
@UseGuards(AuthGlobalGuard)
@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private commentsQueryRepository: CommentsQuerySqlRepository,
    private commentsService: CommentsService,
    private likesQueryRepository: LikesQuerySqlRepository,
  ) {}

  @Get(`:id`)
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Param(`id`) commentId: string, @Request() req) {
    const foundComment = await this.commentsQueryRepository.getCommentById(
      commentId,
    );
    if (!foundComment) throw new NotFoundException(`comment not found`);

    const likeStatus = await this.likesQueryRepository.getExtendedLikesInfo(
      commentId,
      req.headers.authGlobal === undefined
        ? null
        : req.headers.authGlobal.userId,
      false,
    );
    return {
      id: foundComment.id,
      content: foundComment.content,
      commentatorInfo: {
        userId: foundComment.commentatorInfo.userId,
        userLogin: foundComment.commentatorInfo.userLogin,
      },
      createdAt: foundComment.createdAt,
      likesInfo: {
        likesCount: likeStatus.likesCount,
        dislikesCount: likeStatus.dislikesCount,
        myStatus: likeStatus.myStatus,
      },
    };
  }

  @UseGuards(AccessTokenGuard)
  @Put(`:commentId/like-status`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async putLikeStatusByCommentId(
    @Param(`commentId`) commentId: string,
    @Body() likeInputDto: LikeInputDto,
    @Request() request,
  ) {
    return this.commandBus.execute(
      new CreateLikeStatusUseCaseCommand(
        commentId,
        request.user.userId,
        likeInputDto.likeStatus,
      ),
    );
  }

  @Put(`:id`)
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  updateComment(
    @Param(`id`) commentId: string,
    @Body() commentInputDto: CommentInputDto,
    @Request() req,
  ) {
    return this.commentsService.updateComment(
      commentId,
      commentInputDto.content,
      req.user.userId,
    );
  }

  @Delete(`:id`)
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCommentById(@Param(`id`) commentId: string, @Request() req) {
    return this.commentsService.deleteComment(commentId, req.user.userId);
  }
}
