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
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './blogs.query.repository';
import { SortType } from '../users/users.interface';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostsService } from '../posts/posts.service';
import { LikesQueryRepository } from '../likes/likes.query.repository';
import { AuthGuard } from '../../helpers/auth.guard';
import { CreatePostInBlogDto } from '../posts/dto/create-post.dto';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
@UseGuards(AuthGlobalGuard)
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(@Query() query: any) {
    return this.blogsQueryRepository.getAllBlogs(
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
      query?.searchNameTerm && query.searchNameTerm,
    );
  }

  @Get(`:id/posts`)
  async getAllPostsByBlogId(
    @Param(`id`) blogId: string,
    @Query() query: any,
    @Request() req,
  ) {
    const foundPosts = await this.postsQueryRepository.getAllPostsByBlogId(
      blogId,
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
      query?.searchNameTerm && query.searchNameTerm,
    );
    if (foundPosts.items.length === 0) {
      throw new NotFoundException('posts not found');
    }

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

  @Get(`:id`)
  async getBlogById(@Param(`id`) blogId: string) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }
    return foundBlog;
  }

  @UseGuards(AuthGuard)
  @Post()
  async createBlog(@Body() creatBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(creatBlogDto);
  }

  @UseGuards(AuthGuard)
  @Post(`:id/posts`)
  async createPostByBlogId(
    @Param(`id`) blogId: string,
    @Body() createPostDto: CreatePostInBlogDto,
  ) {
    const createdPost = await this.postsService.createPost({
      ...createPostDto,
      blogId,
    });

    const extendedLikesInfo =
      await this.likesQueryRepository.getExtendedLikesInfo(blogId, null);
    return { ...createdPost, extendedLikesInfo };
  }

  @UseGuards(AuthGuard)
  @Put(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param(`id`) blogId: string,
    @Body() updateBlogDto: CreateBlogDto,
  ) {
    const updatedBlog = await this.blogsService.updateBlog(
      blogId,
      updateBlogDto,
    );
    if (!updatedBlog) {
      throw new NotFoundException(`not found blog`);
    }
    return;
  }

  @UseGuards(AuthGuard)
  @Delete(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param(`id`) blogId: string) {
    const deletedBlog = await this.blogsService.deleteBlog(blogId);
    if (!deletedBlog) {
      throw new NotFoundException(`not found blog, bro`);
    }
    return;
  }
}
