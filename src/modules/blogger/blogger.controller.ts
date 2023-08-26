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
import { CreateBlogDto } from './dto/create-blog.dto';
import { BloggerQueryRepository } from './blogger.query.repository';
import { SortType } from '../users/users.interface';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostsService } from '../posts/posts.service';
import { LikesQueryRepository } from '../likes/likes.query.repository';
import { CreatePostInBlogDto } from '../posts/dto/create-post.dto';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
import { CreateBlogUseCase } from './use-cases/createBlogUseCase';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { Request as RequestExpress } from 'express';
import { UpdateBlogUseCase } from './use-cases/updateBlogUseCase';
import { DeleteBlogUseCase } from './use-cases/deleteBlogUseCase';
import { CreatePostByBlogIdUseCase } from '../posts/use-cases/createPostByBlogIdUseCase';
@UseGuards(AuthGlobalGuard)
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private postsService: PostsService,
    private bloggerQueryRepository: BloggerQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
    private createBlogUseCase: CreateBlogUseCase,
    private updateBlogUseCase: UpdateBlogUseCase,
    private deleteBlogUseCase: DeleteBlogUseCase,
    private createPostByBlogIdUseCase: CreatePostByBlogIdUseCase,
  ) {}

  @Put(`:id`)
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param(`id`) blogId: string,
    @Body() updateBlogDto: CreateBlogDto,
    @Request() request: any,
  ) {
    const updatedBlog = await this.updateBlogUseCase.execute(
      blogId,
      updateBlogDto,
      request.user.userId,
    );
    if (!updatedBlog) {
      throw new NotFoundException(`not found blog`);
    }
    return;
  }

  @Delete(`:id`)
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param(`id`) blogId: string, @Request() request: any) {
    return await this.deleteBlogUseCase.execute(blogId, request.user.userId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async createBlog(
    @Body() creatBlogDto: CreateBlogDto,
    @Request() request: any,
  ) {
    return this.createBlogUseCase.execute(creatBlogDto, request.user.userId);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  async getAllBlogs(@Query() query: any, @Request() request: any) {
    return this.bloggerQueryRepository.getAllBlogsCurrentUser(
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
      query?.searchNameTerm && query.searchNameTerm,
      request.user.userId,
    );
  }

  @Post(`:id/posts`)
  @UseGuards(AccessTokenGuard)
  async createPostByBlogId(
    @Param(`id`) blogId: string,
    @Body() createPostDto: CreatePostInBlogDto,
    @Request() request: any,
  ) {
    const createdPost = await this.createPostByBlogIdUseCase.execute(
      {
        ...createPostDto,
        blogId,
      },
      request.user.userId,
    );

    const extendedLikesInfo =
      await this.likesQueryRepository.getExtendedLikesInfo(blogId, null);
    return { ...createdPost, extendedLikesInfo };
  }

  @Get(`:id/posts`)
  @UseGuards(AccessTokenGuard)
  async getAllPostsByBlogId(
    @Param(`id`) blogId: string,
    @Query() query: any,
    @Request() request,
  ) {
    const foundPosts = await this.postsQueryRepository.getAllPostsByBlogId(
      blogId,
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
      query?.searchNameTerm && query.searchNameTerm,
      request.user.userId,
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

  @Get(`:id`)
  @UseGuards(AccessTokenGuard)
  async getBlogById(@Param(`id`) blogId: string) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }
    return foundBlog;
  }
}
