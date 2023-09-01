import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreateBlogDto, ICreateBlogModifiedDto } from './dto/create-blog.dto';
import { Posts } from '../posts/posts.schena';
import { Blogs } from '../blogs/blogs.schena';
@Injectable()
export class BloggerRepository {
  constructor(@InjectModel(Blogs.name) private blogsModel: Model<Blogs>) {}
  createBlog(createBlogDto: ICreateBlogModifiedDto) {
    return this.blogsModel.create(createBlogDto);
  }
  bindBlogWithUser(blogId: string, userId: string) {
    return this.blogsModel.updateOne(
      { id: blogId },
      {
        $set: {
          ownerId: userId,
        },
      },
    );
  }
  updateBlog(blogId: string, updateBlogDto: CreateBlogDto, ownerId: string) {
    return this.blogsModel.updateOne(
      { id: blogId, ownerId },
      {
        $set: {
          name: updateBlogDto.name,
          description: updateBlogDto.description,
          websiteUrl: updateBlogDto.websiteUrl,
        },
      },
    );
  }
  deleteBlog(blogId: string, ownerId: string) {
    return this.blogsModel.deleteOne({ id: blogId, ownerId });
  }
}
