import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs } from '../blogs/blogs.schena';
import { Model } from 'mongoose';
import { Comments } from '../comments/comments.schena';
import { Posts } from '../posts/posts.schena';
import { Users } from '../users/users.schema';
import { Likes } from '../likes/likes.schena';
import { SecurityDevices } from '../security-devices/security-devices.schena';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { Repository } from 'typeorm';
import { SecurityDevicesEntity } from '../security-devices/security-devices.entity';
import { BlogsEntity } from '../blogs/blogs.entity';
import { PostsEntity } from '../posts/posts.entity';
@Controller('testing')
export class TestingController {
  constructor(
    ///// POSTGRESQL
    @InjectRepository(PostsEntity)
    private readonly postsDevicesSqlModel: Repository<PostsEntity>,

    @InjectRepository(BlogsEntity)
    private readonly blogsDevicesSqlModel: Repository<BlogsEntity>,

    @InjectRepository(SecurityDevicesEntity)
    private readonly securityDevicesSqlModel: Repository<SecurityDevicesEntity>,

    @InjectRepository(UserEntity)
    private readonly usersSqlRepository: Repository<UserEntity>,

    ///// MONGODB
    @InjectModel(Blogs.name) private blogsModel: Model<Blogs>,
    @InjectModel(Comments.name) private commentsModel: Model<Comments>,
    @InjectModel(Posts.name) private postsModel: Model<Posts>,
    @InjectModel(Users.name) private userModel: Model<Users>,
    @InjectModel(Likes.name) private likesModel: Model<Likes>,
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

    await this.usersSqlRepository.query(`DELETE FROM public.users`);
    await this.securityDevicesSqlModel.query(
      `DELETE FROM public."securityDevices"`,
    );
    await this.postsDevicesSqlModel.query(`DELETE FROM public.posts`);
    await this.blogsDevicesSqlModel.query(`DELETE FROM public.blogs`);

    return;
  }
}
