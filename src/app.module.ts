import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './modules/users/users.controller';
import { UsersService } from './modules/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './modules/users/users.schema';
import { UsersQueryRepository } from './modules/users/users.query.repository';
import { UsersRepository } from './modules/users/users.repository';
import { BlogsController } from './modules/blogs/blogs.controller';
import { BlogsService } from './modules/blogs/blogs.service';
import { BlogsRepository } from './modules/blogs/blogs.repository';
import { Blogs, BlogsSchema } from './modules/blogs/blogs.schena';
import { BlogsQueryRepository } from './modules/blogs/blogs.query.repository';
import { PostsController } from './modules/posts/posts.controller';
import { PostsService } from './modules/posts/posts.service';
import { PostsRepository } from './modules/posts/posts.repository';
import { Posts, PostsSchema } from './modules/posts/posts.schena';
import { PostsQueryRepository } from './modules/posts/posts.query.repository';
import { CommentsController } from './modules/comments/comments.controller';
import { CommentsService } from './modules/comments/comments.service';
import { CommentsRepository } from './modules/comments/comments.repository';
import { CommentsQueryRepository } from './modules/comments/comments.query.repository';
import { Comments, CommentsSchema } from './modules/comments/comments.schena';
import { TestingController } from './modules/testing/testing.controller';
import { Likes, LikesSchema } from './modules/likes/likes.schena';
import { LikesQueryRepository } from './modules/likes/likes.query.repository';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './modules/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import {
  SecurityDevices,
  SecurityDevicesSchema,
} from './modules/security-devices/security-devices.schena';
import { SecurityDevicesService } from './modules/security-devices/security-devices.service';
import { SecurityDevicesRepository } from './modules/security-devices/security-devices.repository';
import { AccessTokenStrategy } from './modules/auth/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './modules/auth/strategies/refreshToken.strategy';
import { LocalStrategy } from './modules/auth/strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './modules/auth/auth.service';
import { AuthRepository } from './modules/auth/auth.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import * as process from 'process';
import { EmailService } from './modules/email/email.service';
import { config } from 'dotenv';
import { LikesService } from './modules/likes/likes.service';
import { LikesRepository } from './modules/likes/likes.repository';
import { CustomValidator } from './helpers/custom-validators/custom.validator';
import { ThrottlerModule } from '@nestjs/throttler';
import { SecurityDevicesQueryRepositoryRepository } from './modules/security-devices/security-devices.query.repository';
import { SecurityDevicesController } from './modules/security-devices/security-devices.controller';
import { LoginUseCase } from './modules/auth/use-cases/loginUseCase';
import { CreateDeviceSessionUseCase } from './modules/security-devices/use-cases/createDeviceSessionUseCase';
import { RefreshTokenUseCase } from './modules/auth/use-cases/refreshTokenUseCase';
import { LogoutDeviceSessionUseCase } from './modules/security-devices/use-cases/logoutDeviceSessionUseCase';
import { LogoutUseCase } from './modules/auth/use-cases/logoutUseCase';
import { RegistrationUseCase } from './modules/auth/use-cases/registrationUseCase';
import { LogoutAllDeviceSessionUseCase } from './modules/security-devices/use-cases/logoutAllDeviceSessionUseCase';
import { GetMeInfoUseCase } from './modules/auth/use-cases/getMeInfoUseCase';
import { ConfirmationUserUseCase } from './modules/auth/use-cases/confirmationUseCase';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationEmailResendingUseCase } from './modules/auth/use-cases/registrationEmailResendingUseCase';
import { ValidateUserUseCase } from './modules/auth/use-cases/validateUserUseCase';
import { CreateBlogUseCase } from './modules/blogger/use-cases/createBlogUseCase';
import { BloggerController } from './modules/blogger/blogger.controller';
import { BloggerRepository } from './modules/blogger/blogger.repository';
import { BloggerQueryRepository } from './modules/blogger/blogger.query.repository';
import { BloggerService } from './modules/blogger/blogger.service';
import { Bloggers, BloggersSchema } from './modules/blogger/blogger.schena';
import { UpdateBlogUseCase } from './modules/blogger/use-cases/updateBlogUseCase';
import { DeleteBlogUseCase } from './modules/blogger/use-cases/deleteBlogUseCase';
import { CreatePostByBlogIdUseCase } from './modules/posts/use-cases/createPostByBlogIdUseCase';
config();
const useCases = [
  CreateDeviceSessionUseCase,
  RefreshTokenUseCase,
  LogoutAllDeviceSessionUseCase,
  LogoutDeviceSessionUseCase,
  LoginUseCase,
  LogoutUseCase,
  RegistrationUseCase,
  GetMeInfoUseCase,
  ConfirmationUserUseCase,
  RegistrationEmailResendingUseCase,
  ValidateUserUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostByBlogIdUseCase,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    MailerModule.forRoot({
      transport: {
        service: `gmail`,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    PassportModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGOOSE_URL!),
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: SecurityDevices.name, schema: SecurityDevicesSchema },
      { name: Blogs.name, schema: BlogsSchema },
      { name: Bloggers.name, schema: BloggersSchema },
      { name: Posts.name, schema: PostsSchema },
      { name: Likes.name, schema: LikesSchema },
      { name: Comments.name, schema: CommentsSchema },
    ]),
  ],
  controllers: [
    AuthController,
    AppController,
    UsersController,
    BlogsController,
    BloggerController,
    PostsController,
    CommentsController,
    TestingController,
    SecurityDevicesController,
  ],
  providers: [
    ...useCases,
    AppService,
    AuthService,
    UsersService,
    BlogsService,
    CommentsService,
    EmailService,
    PostsService,
    LikesService,
    BloggerService,
    SecurityDevicesService,
    AuthRepository,
    UsersRepository,
    BlogsRepository,
    BloggerRepository,
    PostsRepository,
    LikesRepository,
    SecurityDevicesRepository,
    CommentsRepository,
    LikesQueryRepository,
    BlogsQueryRepository,
    BloggerQueryRepository,
    UsersQueryRepository,
    PostsQueryRepository,
    SecurityDevicesQueryRepositoryRepository,
    CommentsQueryRepository,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    LocalStrategy,
    CustomValidator,
  ],
})
export class AppModule {}
