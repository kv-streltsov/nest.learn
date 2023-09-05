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
import { PostsQueryRepository } from './posts.query.repository';
import { SortType } from '../users/users.interface';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { LikesQueryRepository } from '../likes/likes.query.repository';
import { AuthGuard } from '../../helpers/auth.guard';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { LikeInputDto } from '../likes/dto/create-like.dto';
import { LikesService } from '../likes/likes.service';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
import { CommentInputDto } from '../comments/dto/create-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { DeletePostByIdUseCase } from './use-cases/delete-post-by-id-use-case.service';
@UseGuards(AuthGlobalGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
    private likesService: LikesService,
    private commentsService: CommentsService,
    private deletePostByBlogIdUseCase: DeletePostByIdUseCase,
  ) {}

  @Get()
  async getAllPosts(@Query() query: any, @Request() req) {
    const foundPosts = await this.postsQueryRepository.getAllPosts(
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
      query?.searchNameTerm && query.searchNameTerm,
    );
    foundPosts.items = await Promise.all(
      foundPosts.items.map(async (post: { id: string }): Promise<any> => {
        const extendedLikesInfo =
          await this.likesQueryRepository.getExtendedLikesInfo(
            post.id,
            req.headers.authGlobal === undefined
              ? null
              : req.headers.authGlobal.userId,
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

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() createPostDto: CreatePostDto) {
    const createdPost = await this.postsService.createPost(createPostDto);
    const extendedLikesInfo =
      await this.likesQueryRepository.getExtendedLikesInfo(
        createdPost.id,
        null,
      );

    return {
      ...createdPost,
      extendedLikesInfo,
    };
  }

  @Post(`:id/comments`)
  @UseGuards(AccessTokenGuard)
  async createCommentInPost(
    @Param(`id`) postId: string,
    @Body() commentInputDto: CommentInputDto,
    @Request() request: any,
  ) {
    //TODO: не могу перенести логику поиска блога в сервис
    const foundPost = await this.postsQueryRepository.getPostById(postId);
    if (foundPost === null) {
      throw new NotFoundException('Post not found');
    }
    return this.commentsService.createCommentInPost(
      commentInputDto,
      postId,
      request.user,
    );
  }

  @Put(`:id`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Body() updatePostDto: CreatePostDto,
    @Param(`id`) postId: string,
  ) {
    const updatedPost = await this.postsService.updatePost(
      postId,
      updatePostDto,
    );
    if (!updatedPost) {
      throw new NotFoundException('post not found');
    }
    return;
  }

  @Put(`:postId/like-status`)
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async putLikeStatusByPostId(
    @Body() likeStatus: LikeInputDto,
    @Param(`postId`) postId: string,
    @Request() req,
  ) {
    return this.likesService.createLikeStatus(
      postId,
      req.user.userId,
      likeStatus.likeStatus,
    );
  }

  @Delete(`:postId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlogId(@Param(`postId`) postId: string) {
    return await this.deletePostByBlogIdUseCase.execute(postId);
  }
}
