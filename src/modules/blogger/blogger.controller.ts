import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { PostsQueryRepository } from '../posts/repositories/mongodb/posts.query.repository';
import { LikesQueryRepository } from '../likes/repositories/mongodb/likes.query.repository';
import { CreatePostInBlogDto } from '../posts/dto/create-post.dto';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
import { CreateBlogUseCase } from './use-cases/createBlogUseCase';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { UpdateBlogUseCase } from './use-cases/updateBlogUseCase';
import { DeleteBlogUseCase } from './use-cases/deleteBlogUseCase';
import { CreatePostByBlogIdUseCase } from '../posts/use-cases/mongodb/createPostByBlogIdUseCase';
import { UpdatePostByBlogIdUseCase } from './use-cases/updatePostByBlogIdUseCase';
import { DeletePostByIdUseCase } from '../posts/use-cases/mongodb/delete-post-by-id-use-case.service';
@UseGuards(AuthGlobalGuard)
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private bloggerQueryRepository: BloggerQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
    private createBlogUseCase: CreateBlogUseCase,
    private updateBlogUseCase: UpdateBlogUseCase,
    private deleteBlogUseCase: DeleteBlogUseCase,
    private createPostByBlogIdUseCase: CreatePostByBlogIdUseCase,
    private updatePostByBlogIdUseCase: UpdatePostByBlogIdUseCase,
  ) {}

  @Put(`:id`)
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param(`id`) blogId: string,
    @Body() updateBlogDto: CreateBlogDto,
    @Request() request: any,
  ) {
    return this.updateBlogUseCase.execute(
      blogId,
      updateBlogDto,
      request.user.userId,
    );
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
    return this.bloggerQueryRepository.getAllBlogs(
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
      // request.user.userId,
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

  @Put(`:blogId/posts/:postId`)
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlogId(
    @Param(`blogId`) blogId: string,
    @Param(`postId`) postId: string,
    @Body() updatePostDto: CreatePostInBlogDto,
    @Request() request: any,
  ) {
    return await this.updatePostByBlogIdUseCase.execute(
      blogId,
      postId,
      updatePostDto,
      request.user.userId,
    );
  }
}
