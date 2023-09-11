import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './modules/users/users.controller';
import { UsersService } from './modules/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './modules/users/users.schema';
import { UsersQueryRepository } from './modules/users/repositories/mongodb/users.query.repository';
import { UsersRepository } from './modules/users/repositories/mongodb/users.repository';
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
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  SecurityDevices,
  SecurityDevicesSchema,
} from './modules/security-devices/security-devices.schena';
import { SecurityDevicesService } from './modules/security-devices/security-devices.service';
import { SecurityDevicesRepository } from './modules/security-devices/repositories/mongodb/security-devices.repository';
import { AccessTokenStrategy } from './modules/auth/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './modules/auth/strategies/refreshToken.strategy';
import { LocalStrategy } from './modules/auth/strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './modules/auth/auth.service';
import { MailerModule } from '@nestjs-modules/mailer';
import * as process from 'process';
import { EmailService } from './modules/email/email.service';
import { config } from 'dotenv';
import { LikesService } from './modules/likes/likes.service';
import { LikesRepository } from './modules/likes/likes.repository';
import { CustomValidator } from './helpers/custom-validators/custom.validator';
import { ThrottlerModule } from '@nestjs/throttler';
import { SecurityDevicesQueryRepositoryRepository } from './modules/security-devices/repositories/mongodb/security-devices.query.repository';
import { SecurityDevicesController } from './modules/security-devices/security-devices.controller';
import { LoginUseCase } from './modules/auth/use-cases/mongodb/loginUseCase';
import { CreateDeviceSessionUseCase } from './modules/security-devices/use-cases/mongodb/createDeviceSessionUseCase';
import { RefreshTokenUseCase } from './modules/auth/use-cases/mongodb/refreshTokenUseCase';
import { LogoutDeviceSessionUseCase } from './modules/security-devices/use-cases/mongodb/logoutDeviceSessionUseCase';
import { LogoutUseCase } from './modules/auth/use-cases/mongodb/logoutUseCase';
import { RegistrationUseCase } from './modules/auth/use-cases/mongodb/registrationUseCase';
import { LogoutAllDeviceSessionUseCase } from './modules/security-devices/use-cases/mongodb/logoutAllDeviceSessionUseCase';
import { GetMeInfoUseCase } from './modules/auth/use-cases/mongodb/getMeInfoUseCase';
import { ConfirmationUserUseCase } from './modules/auth/use-cases/mongodb/confirmationUseCase';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationEmailResendingUseCase } from './modules/auth/use-cases/mongodb/registrationEmailResendingUseCase';
import { ValidateUserUseCase } from './modules/auth/use-cases/mongodb/validateUserUseCase';
import { CreateBlogUseCase } from './modules/blogger/use-cases/createBlogUseCase';
import { BloggerController } from './modules/blogger/blogger.controller';
import { BloggerRepository } from './modules/blogger/blogger.repository';
import { BloggerQueryRepository } from './modules/blogger/blogger.query.repository';
import { BloggerService } from './modules/blogger/blogger.service';
import { UpdateBlogUseCase } from './modules/blogger/use-cases/updateBlogUseCase';
import { DeleteBlogUseCase } from './modules/blogger/use-cases/deleteBlogUseCase';
import { CreatePostByBlogIdUseCase } from './modules/posts/use-cases/createPostByBlogIdUseCase';
import { UpdatePostByBlogIdUseCase } from './modules/blogger/use-cases/updatePostByBlogIdUseCase';
import { DeletePostByIdUseCase } from './modules/posts/use-cases/delete-post-by-id-use-case.service';
import { SuperAdminController } from './modules/super-admin/super-admin.controller';
import { BindBlogWithUserUseCase } from './modules/super-admin/use-cases/bindBlogWithUserUseCase';
import { CreateUserUseCase } from './modules/users/use-cases/mongodb/createUserUseCase';
import { DeleteUserUseCase } from './modules/users/use-cases/mongodb/deleteUserUseCase';
import { BanUserUseCase } from './modules/super-admin/use-cases/banUserUseCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSqlRepository } from './modules/users/repositories/postgresql/users.sql.repository';
import { UserEntity } from './modules/users/user.entity';
import { CreateUserSqlUseCase } from './modules/users/use-cases/postgresql/createUserSqlUseCase';
import { UsersSqlService } from './modules/users/users.sql.service';
import { UsersSqlQueryRepository } from './modules/users/repositories/postgresql/users.sql.query.repository';
import { DeleteUserSqlUseCase } from './modules/users/use-cases/postgresql/deleteUserSqlUseCase';
import { RegistrationSqlUseCase } from './modules/auth/use-cases/postgresql/registrationSqlUseCase';
import { SecurityDevicesEntity } from './modules/security-devices/security-devices.entity';
import { LoginSqlUseCase } from './modules/auth/use-cases/postgresql/loginSqlUseCase';
import { CreateDeviceSessionSqlUseCase } from './modules/security-devices/use-cases/postgresql/createDeviceSessionSqlUseCase';
import { SecurityDevicesSqlRepository } from './modules/security-devices/repositories/postgresql/security-devices.sql.repository';
import { SecurityDevicesSqlQueryRepository } from './modules/security-devices/repositories/postgresql/security-devices.sql.query.repository';
import { LogoutSqlUseCase } from './modules/auth/use-cases/postgresql/logoutSqlUseCase';
import { RegistrationEmailResendingSqlUseCase } from './modules/auth/use-cases/postgresql/registrationEmailResendingSqlUseCase';
config();
const useCases = [
  RegistrationEmailResendingSqlUseCase,
  LogoutSqlUseCase,
  LoginSqlUseCase,
  RegistrationSqlUseCase,
  CreateUserSqlUseCase,
  DeleteUserSqlUseCase,
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
  UpdatePostByBlogIdUseCase,
  DeletePostByIdUseCase,
  BindBlogWithUserUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  BanUserUseCase,
  CreateDeviceSessionSqlUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '3230sas',
      database: 'learn.nest',
      autoLoadEntities: false,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([UserEntity, SecurityDevicesEntity]),
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
      { name: Posts.name, schema: PostsSchema },
      { name: Likes.name, schema: LikesSchema },
      { name: Comments.name, schema: CommentsSchema },
    ]),
  ],
  controllers: [
    SuperAdminController,
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
    SecurityDevicesSqlRepository,
    AppService,
    AuthService,
    BlogsService,
    CommentsService,
    EmailService,
    PostsService,
    LikesService,
    BloggerService,
    SecurityDevicesService,
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    UsersSqlService,
    UsersSqlQueryRepository,
    UsersSqlRepository,
    BlogsRepository,
    BloggerRepository,
    PostsRepository,
    LikesRepository,
    SecurityDevicesRepository,
    SecurityDevicesSqlQueryRepository,
    CommentsRepository,
    LikesQueryRepository,
    BlogsQueryRepository,
    BloggerQueryRepository,
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
