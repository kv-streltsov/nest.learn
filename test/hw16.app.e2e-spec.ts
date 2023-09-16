import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestExceptionFilter } from '../src/helpers/excaption.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors) => {
          const result = errors.map((error: any) => ({
            field: error.property,
            message: error.constraints[Object.keys(error.constraints)[0]],
          }));
          return new BadRequestException(result);
        },
        stopAtFirstError: false,
      }),
    );
    app.useGlobalFilters(new TestExceptionFilter());
    app.enableCors();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();
  });

  const userOne = {
    id: null,
    login: `userOne`,
    email: 'userOne@one.com',
    password: 'qewrqwer',
    accessToken: null,
  };
  let firstBlogIdOwnUserOne: string;
  let firstPostIdOwnUserOne: string;
  let firstCommentIdOwnUserOne: string;

  it('/ (GET Hello World!)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
  /////////////////////////////    REPARATION    /////////////////////////////////////////
  it('DELETE ALL DATA', async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  }, 100000);
  it('CREATE USER', async () => {
    // USER 1
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({
        login: userOne.login,
        email: userOne.email,
        password: userOne.password,
      })
      .expect(201);
  });
  it('LOGIN USER', async () => {
    // USER 1
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: userOne.email,
        password: userOne.password,
      })
      .expect(200);
    userOne.accessToken = response.body.accessToken;
  });

  /////////////////////////////    BLOG FLOW    /////////////////////////////////////////
  it('CREATE BLOGS', async () => {
    // USER 1
    const newBlog = await request(app.getHttpServer())
      .post(`/sa/blogs`)
      .auth('admin', 'qwerty')
      .send({
        name: 'firstBlog',
        description: 'firstBlog description',
        websiteUrl: 'https://www.youtube.com/firstBlog',
      })
      .expect(201);
    firstBlogIdOwnUserOne = newBlog.body.id;
    // TO EQUAL FIRST BLOG
    expect(newBlog.body).toEqual({
      id: expect.any(String),
      createdAt: expect.any(String),
      description: 'firstBlog description',
      isMembership: false,
      name: 'firstBlog',
      websiteUrl: 'https://www.youtube.com/firstBlog',
    });
  });
  /// POSTS
  it('CREATE POST BY BLOG ID', async () => {
    // CREATE THREE POSTS USER ONE
    const newPost = await request(app.getHttpServer())
      .post(`/sa/blogs/${firstBlogIdOwnUserOne}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'firstPost title',
        shortDescription: 'firstPost Description',
        content: 'firstPost content',
      })
      .expect(201);
    firstPostIdOwnUserOne = newPost.body.id;
    expect(newPost.body).toEqual({
      id: expect.any(String),
      blogId: firstBlogIdOwnUserOne,
      blogName: 'firstBlog',
      title: 'firstPost title',
      shortDescription: 'firstPost Description',
      createdAt: expect.any(String),
      content: 'firstPost content',
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    // ERRORS
    const errorMessages = await request(app.getHttpServer())
      .post(`/sa/blogs/${firstBlogIdOwnUserOne}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 1,
        shortDescription:
          'thirdPost DescriptionthirdPost DescriptionthirdPost DescriptionthirdPost DescriptionthirdPost DescriptionthirdPost DescriptionthirdPost DescriptionthirdPost DescriptionthirdPost Description',
      })
      .expect(400);
    expect(errorMessages.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'title must be shorter than or equal to 30 characters',
        },
        {
          field: 'shortDescription',
          message:
            'shortDescription must be shorter than or equal to 100 characters',
        },
        {
          field: 'content',
          message: 'content must be shorter than or equal to 1000 characters',
        },
      ],
    });

    await request(app.getHttpServer())
      .post(`/sa/blogs/${firstBlogIdOwnUserOne}/posts`)
      .send({
        title: 'thirdPost title',
        shortDescription: 'thirdPost Description',
        content: 'thirdPost content',
      })
      .expect(401);

    await request(app.getHttpServer())
      .post(`/sa/blogs/367eb779-deb2-483b-9015-059c5d8c5edc/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'thirdPost title',
        shortDescription: 'thirdPost Description',
        content: 'thirdPost content',
      })
      .expect(404);
  });
  /// COMMENTS
  it('CREATE COMMENT BY POST ID', async () => {
    // CREATE THREE POSTS USER ONE
    const response = await request(app.getHttpServer())
      .post(`/posts/${firstPostIdOwnUserOne}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        content: 'first comment in first post own user one',
      })
      .expect(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      entityId: expect.any(String),
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: 'userOne',
      },
      content: 'first comment in first post own user one',
      createdAt: expect.any(String),
    });
  });
});
