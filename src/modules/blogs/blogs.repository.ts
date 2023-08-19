import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blogs } from './blogs.schena';
import { Injectable } from '@nestjs/common';
import { CreateBlogDto, ICreateBlogModifiedDto } from './dto/create-blog.dto';
@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blogs.name) private blogsModel: Model<Blogs>) {}
  createBlog(createBlogDto: ICreateBlogModifiedDto) {
    return this.blogsModel.create(createBlogDto);
  }
  updateBlog(blogId: string, updateBlogDto: CreateBlogDto) {
    return this.blogsModel.updateOne(
      { id: blogId },
      {
        $set: {
          name: updateBlogDto.name,
          description: updateBlogDto.description,
          websiteUrl: updateBlogDto.websiteUrl,
        },
      },
    );
  }
  deleteBlog(blogId: string) {
    return this.blogsModel.deleteOne({ id: blogId });
  }
}
