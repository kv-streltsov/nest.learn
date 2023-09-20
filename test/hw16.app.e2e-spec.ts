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
  it('PUT BLOG', async () => {
    // UPDATE FIRST BLOG USER ONE
    await request(app.getHttpServer())
      .put(`/sa/blogs/${firstBlogIdOwnUserOne}`)
      .auth('admin', 'qwerty')
      .send({
        name: 'updateBlog',
        description: 'updateBlog description',
        websiteUrl: 'https://www.youtube.com/updateBlog',
      })
      .expect(204);
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
      blogName: 'updateBlog',
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
  it('PUT POST', async () => {
    // CREATE THREE POSTS USER ONE
    await request(app.getHttpServer())
      .put(`/sa/blogs/${firstBlogIdOwnUserOne}/posts/${firstPostIdOwnUserOne}`)
      .auth('admin', 'qwerty')
      .send({
        title: 'firstPostUpdate title',
        shortDescription: 'firstPostUpdate Description',
        content: 'firstPostUpdate content',
      })
      .expect(204);

    const response = await request(app.getHttpServer())
      .get(`/posts/${firstPostIdOwnUserOne}`)
      .auth('admin', 'qwerty')
      .expect(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      blogId: expect.any(String),
      title: 'firstPostUpdate title',
      blogName: 'updateBlog',
      shortDescription: 'firstPostUpdate Description',
      content: 'firstPostUpdate content',
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });
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
    firstCommentIdOwnUserOne = response.body.id;
    expect(response.body).toEqual({
      id: expect.any(String),
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: 'userOne',
      },
      content: 'first comment in first post own user one',
      createdAt: expect.any(String),
      likesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
      },
    });
  });

  it('PUT LIKE IN COMMENT', async () => {
    // PUT LIKE IN COMMENT USER ONE
    await request(app.getHttpServer())
      .put(`/comments/${firstCommentIdOwnUserOne}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        likeStatus: 'None',
      })
      .expect(204);
    let response = await request(app.getHttpServer())
      .get(`/comments/${firstCommentIdOwnUserOne}`)
      .expect(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      content: 'first comment in first post own user one',
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: 'userOne',
      },
      createdAt: expect.any(String),
      likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
    });
    /// put and check like
    await request(app.getHttpServer())
      .put(`/comments/${firstCommentIdOwnUserOne}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        likeStatus: 'Like',
      })
      .expect(204);
    response = await request(app.getHttpServer())
      .get(`/comments/${firstCommentIdOwnUserOne}`)
      .expect(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      content: 'first comment in first post own user one',
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: 'userOne',
      },
      createdAt: expect.any(String),
      likesInfo: { likesCount: 1, dislikesCount: 0, myStatus: 'None' },
    });
    /// put and check dislike
    await request(app.getHttpServer())
      .put(`/comments/${firstCommentIdOwnUserOne}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(204);
    response = await request(app.getHttpServer())
      .get(`/comments/${firstCommentIdOwnUserOne}`)
      .expect(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      content: 'first comment in first post own user one',
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: 'userOne',
      },
      createdAt: expect.any(String),
      likesInfo: { likesCount: 0, dislikesCount: 1, myStatus: 'None' },
    });
  });
  it('PUT COMMENT', async () => {
    // CREATE THREE POSTS USER ONE
    await request(app.getHttpServer())
      .put(`/comments/${firstCommentIdOwnUserOne}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        content: 'update comment in first post own user one',
      })
      .expect(204);
  });
  it('DELETE COMMENT BY ID', async () => {
    // DELETE
    await request(app.getHttpServer())
      .delete(`/comments/${firstCommentIdOwnUserOne}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(204);
    /// ERROR
    await request(app.getHttpServer())
      .delete(`/comments/${firstCommentIdOwnUserOne}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(404);
  });
  ///
  it('CREATE BLOGS', async () => {
    const newBlog = await request(app.getHttpServer())
        .post(`/sa/blogs`)
        .auth('admin', 'qwerty')
        .send({
          name: 'firstBlog',
          description: 'firstBlog description',
          websiteUrl: 'https://www.youtube.com/firstBlog',
        })
        .expect(201);
    const newPost = await request(app.getHttpServer())
        .post(`/sa/blogs/${newBlog.body.id}/posts`)
        .auth('admin', 'qwerty')
        .send({
          title: 'firstPost title',
          shortDescription: 'firstPost Description',
          content: 'firstPost content',
        })
        .expect(201);
    const newComment = await request(app.getHttpServer())
        .post(`/posts/${newPost.body.id}/comments`)
        .set('Authorization', `Bearer ${userOne.accessToken}`)
        .send({
          content: 'first comment in first post own user one',
        })
        .expect(201);
    const  response= await request(app.getHttpServer())
        .get(`/posts/${newPost.body.id}/comments`)
        .set('Authorization', `Bearer ${userOne.accessToken}`)
        .send({
          content: 'first comment in first post own user one',
        })
        .expect(201);
    // GET -> "/posts/:postId/comments":
  });
});
