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
import { CommentsQueryRepository } from './comments.query.repository';
import { LikeInputDto } from '../likes/dto/create-like.dto';
import { CommentInputDto } from './dto/create-comment.dto';

import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { LikesService } from '../likes/likes.service';
import { CommentsService } from './comments.service';
import { LikesQueryRepository } from '../likes/likes.query.repository';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
@UseGuards(AuthGlobalGuard)
@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private likesService: LikesService,
    private commentsService: CommentsService,
    private likesQueryRepository: LikesQueryRepository,
  ) {}

  @Get(`:id`)
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Param(`id`) commentId: string, @Request() req) {
    const finedComment = await this.commentsQueryRepository.getCommentById(
      commentId,
    );
    if (!finedComment) {
      throw new NotFoundException(`comment not found`);
    }
    const likeStatus = await this.likesQueryRepository.getExtendedLikesInfo(
      commentId,
      req.headers.authGlobal === undefined
        ? null
        : req.headers.authGlobal.userId,
    );
    return {
      id: finedComment.id,
      content: finedComment.content,
      commentatorInfo: {
        userId: finedComment.commentatorInfo.userId,
        userLogin: finedComment.commentatorInfo.userLogin,
      },
      createdAt: finedComment.createdAt,
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
  putLikeStatusByCommentId(
    @Param(`commentId`) commentId: string,
    @Body() likeInputDto: LikeInputDto,
    @Request() req,
  ) {
    return this.likesService.createLikeStatus(
      commentId,
      req.user.userId,
      likeInputDto.likeStatus,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Put(`:id`)
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

  @UseGuards(AccessTokenGuard)
  @Delete(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCommentById(@Param(`id`) commentId: string, @Request() req) {
    return this.commentsService.deleteComment(commentId, req.user.userId);
  }
}
