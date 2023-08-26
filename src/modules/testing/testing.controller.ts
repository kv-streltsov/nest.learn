import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs } from '../blogs/blogs.schena';
import { Model } from 'mongoose';
import { Comments } from '../comments/comments.schena';
import { Posts } from '../posts/posts.schena';
import { Users } from '../users/users.schema';
import { Likes } from '../likes/likes.schena';
import { SecurityDevices } from '../security-devices/security-devices.schena';
import { Bloggers } from '../blogger/blogger.schena';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blogs.name) private blogsModel: Model<Blogs>,
    @InjectModel(Comments.name) private commentsModel: Model<Comments>,
    @InjectModel(Posts.name) private postsModel: Model<Posts>,
    @InjectModel(Users.name) private userModel: Model<Users>,
    @InjectModel(Likes.name) private likesModel: Model<Likes>,
    @InjectModel(Bloggers.name) private bloggersModel: Model<Bloggers>,
    @InjectModel(SecurityDevices.name)
    private securityDevicesModel: Model<SecurityDevices>,
  ) {}

  @Delete(`all-data`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.blogsModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.postsModel.deleteMany({});
    await this.commentsModel.deleteMany({});
    await this.likesModel.deleteMany({});
    await this.securityDevicesModel.deleteMany({});
    await this.bloggersModel.deleteMany({});
    return;
  }
}
