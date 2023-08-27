import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bloggers } from './blogger.schena';
import { Injectable } from '@nestjs/common';
import { CreateBlogDto, ICreateBlogModifiedDto } from './dto/create-blog.dto';
import { Posts } from '../posts/posts.schena';
@Injectable()
export class BloggerRepository {
  constructor(
    @InjectModel(Bloggers.name) private bloggersModel: Model<Bloggers>,
  ) {}
  createBlog(createBlogDto: ICreateBlogModifiedDto) {
    return this.bloggersModel.create(createBlogDto);
  }
  bindBlogWithUser(blogId: string, userId: string) {
    return this.bloggersModel.updateOne(
      { id: blogId },
      {
        $set: {
          ownerId: userId,
        },
      },
    );
  }
  updateBlog(blogId: string, updateBlogDto: CreateBlogDto, ownerId: string) {
    return this.bloggersModel.updateOne(
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
    return this.bloggersModel.deleteOne({ id: blogId, ownerId });
  }
}
