import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './repositories/mongodb/posts.query.repository';
import { SortType } from '../users/users.interface';
import { CommentsQueryRepository } from '../comments/repositories/mongodb/comments.query.repository';
import { LikesQueryRepository } from '../likes/repositories/mongodb/likes.query.repository';
import { AuthGuard } from '../../helpers/auth.guard';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { LikeInputDto } from '../likes/dto/create-like.dto';
import { LikesService } from '../likes/likes.service';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
import { CommentInputDto } from '../comments/dto/create-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { DeletePostByIdUseCase } from './use-cases/mongodb/delete-post-by-id-use-case.service';
import { PostsQuerySqlRepository } from './repositories/postgresql/posts.query.sql.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentInPostSqlUseCaseCommand } from '../comments/use-cases/postgresql/createCommentInPostSqlUseCase';
import {CommentsQuerySqlRepository} from "../comments/repositories/postgresql/comments.query.sql.repository";
import {LikesQuerySqlRepository} from "../likes/repositories/postgresql/likes.query.sql.repository";
import {CreateLikeStatusUseCaseCommand} from "../likes/use-cases/postgresql/createLikeStatusSqlUseCase";
@UseGuards(AuthGlobalGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private postsQueryRepository: PostsQuerySqlRepository,
    private commentsQueryRepository: CommentsQuerySqlRepository,
    private likesQueryRepository: LikesQuerySqlRepository,
    private deletePostByBlogIdUseCase: DeletePostByIdUseCase,
  ) {}

  @Get(`:id`)
  async getPostById(@Param(`id`) postId: string, @Request() req) {
    const foundPost = await this.postsQueryRepository.getPostById(postId);
    if (foundPost === null) {
      throw new NotFoundException(`post not found`);
    }

    const extendedLikesInfo =
      await this.likesQueryRepository.getExtendedLikesInfo(
        postId,
        req.headers.authGlobal === undefined
          ? null
          : req.headers.authGlobal.userId,
      );
    return {
      ...foundPost,
      extendedLikesInfo,
    };
  }

  @Get()
  async getAllPosts(@Query() query: any, @Request() request) {
    const foundPosts = await this.postsQueryRepository.getAllPosts(
      query?.pageSize && Number(query.pageSize),
      query?.pageNumber && Number(query.pageNumber),
      query?.sortBy && query.sortBy,
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
    );
    foundPosts.items = await Promise.all(
      foundPosts.items.map(async (post: { id: string }): Promise<any> => {
        const extendedLikesInfo =
          await this.likesQueryRepository.getExtendedLikesInfo(
            post.id,
              request.headers.authGlobal === undefined
              ? null
              : request.headers.authGlobal.userId,
          );
        return {
          ...post,
          extendedLikesInfo,
        };
      }),
    );
    return foundPosts;
  }

  @Get(`:id/comments`)
  async getCommentsByPostId(
      @Param(`id`) postId: string,
      @Query() query: any,
      @Request() request: any,
  ) {
    const foundComments =
        await this.commentsQueryRepository.getCommentsByPostId(
            postId,
            query?.pageNumber && Number(query.pageNumber),
            query?.pageSize && Number(query.pageSize),
            query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
            query?.sortBy && query.sortBy,
        );
    foundComments.items = await Promise.all(
        foundComments.items.map(async (comment: { id: string }): Promise<any> => {
          const likesInfo = await this.likesQueryRepository.getExtendedLikesInfo(
              comment.id,
              request.headers.authGlobal === undefined
                  ? null
                  : request.headers.authGlobal.userId,
              false,
          );
          return {
            ...comment,
            likesInfo,
          };
        }),
    );
    return foundComments;
  }

  @Post(`/:id/comments`)
  @UseGuards(AccessTokenGuard)
  async createCommentByPostId(
    @Param(`id`) postId: string,
    @Body() commentDto: CommentInputDto,
    @Request() request,
  ) {
    return this.commandBus.execute(
      new CreateCommentInPostSqlUseCaseCommand(
        commentDto,
        postId,
        request.user,
      ),
    );
  }



  @Put(`:postId/like-status`)
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async putLikeStatusByPostId(
    @Body() likeStatus: LikeInputDto,
    @Param(`postId`) postId: string,
    @Request() request,
  ) {
    return this.commandBus.execute(new CreateLikeStatusUseCaseCommand(postId,request.user.userId,likeStatus.likeStatus))

  }

  @Delete(`:postId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlogId(@Param(`postId`) postId: string) {
    return await this.deletePostByBlogIdUseCase.execute(postId);
  }
}
