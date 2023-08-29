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

const userOne = {
  login: 'qwertya',
  password: 'qwertya',
  email: 'aaa@yandex.ru',
  id: null,
  accessToken: null,
  refreshToken: `null`,
};
const userTwo = {
  login: 'qwertyb',
  password: 'qwertyb',
  email: 'bbb@yandex.ru',
  id: null,
  accessToken: null,
  refreshToken: `null`,
};
let blogIdOwnUserOne: any;
let blogIdOwnUserTwo: any;
let secondBlogIdOwnUserTwo: any;
let postIdOwnUserOne: any;
let secondPostIdOwnUserOne: any;
let postIdOwnerUserTwo: any;
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
  it('CREATE TWO USERS', async () => {
    // USER 1
    let response = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(userOne)
      .expect(201);
    userOne.id = response.body.id;
    expect(response.body).toEqual({
      id: expect.any(String),
      login: userOne.login,
      email: userOne.email,
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });

    // USER 2
    response = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(userTwo)
      .expect(201);
    userTwo.id = response.body.id;
  });
  it('LOGIN TWO USERS | should return JWT Pair ', async () => {
    /// LOGIN USER ///

    // LOGIN USER 1
    let response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: userOne.email,
        password: userOne.password,
      })
      .expect(200);
    userOne.accessToken = response.body.accessToken;

    // LOGIN USER 2
    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: userTwo.email,
        password: userTwo.password,
      })
      .expect(200);
    userTwo.accessToken = response.body.accessToken;
  });
  /////////////////////////////    BLOGGER FLOW    /////////////////////////////////////////
  it('CREATE BLOGS', async () => {
    // CREATE THREE BLOG USER ONE
    let newBlog = await request(app.getHttpServer())
      .post(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        name: 'firstBlog',
        description: 'firstBlog description',
        websiteUrl: 'https://www.youtube.com/firstBlog',
      })
      .expect(201);
    blogIdOwnUserOne = newBlog.body.id;
    // TO EQUAL FIRST BLOG
    expect(newBlog.body).toEqual({
      id: expect.any(String),
      createdAt: expect.any(String),
      description: 'firstBlog description',
      isMembership: false,
      name: 'firstBlog',
      websiteUrl: 'https://www.youtube.com/firstBlog',
    });

    await request(app.getHttpServer())
      .post(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        name: 'secondBlog',
        description: 'secondBlog description',
        websiteUrl: 'https://www.youtube.com/secondBlog',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        name: 'thirdBlog',
        description: 'thirdBlog description',
        websiteUrl: 'https://www.youtube.com/thirdBlog',
      })
      .expect(201);

    // CREATE TWO BLOG USER TWO
    newBlog = await request(app.getHttpServer())
      .post(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({
        name: 'userTwoFirst',
        description: 'userTwoFirstBlog test description',
        websiteUrl: 'https://www.youtube.com/userTwoFirstBlog',
      })
      .expect(201);
    blogIdOwnUserTwo = newBlog.body.id;
    newBlog = await request(app.getHttpServer())
      .post(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({
        name: 'userTwoSecond',
        description: 'userTwoSecondBlog test description',
        websiteUrl: 'https://www.youtube.com/userTwoSecondBlog',
      })
      .expect(201);
    secondBlogIdOwnUserTwo = newBlog.body.id;
    // ERROR
    const errorMessages = await request(app.getHttpServer())
      .post(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({
        name: 'userTwoSecondqweqweqweqwe',
        description: 1,
      })
      .expect(400);
    expect(errorMessages.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name must be shorter than or equal to 15 characters',
        },
        {
          field: 'description',
          message:
            'description must be shorter than or equal to 500 characters',
        },
        {
          field: 'websiteUrl',
          message:
            'websiteUrl must match ^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$ regular expression',
        },
      ],
    });

    await request(app.getHttpServer())
      .post(`/blogger/blogs`)
      .set('Authorization', `Bearer dfsdfsdfsdfsdaf`)
      .send({
        name: 'userTwoSecond',
        description: 'userTwoSecondBlog test description',
        websiteUrl: 'https://www.youtube.com/userTwoSecondBlog',
      })
      .expect(401);
  });
  it('GET BLOG', async () => {
    // GET THREE BLOG USER ONE
    const foundBlogs = await request(app.getHttpServer())
      .get(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(200);
    // TO EQUAL FIRST BLOG
    expect(foundBlogs.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: expect.any(String),
          name: 'userTwoSecond',
          description: 'userTwoSecondBlog test description',
          websiteUrl: 'https://www.youtube.com/userTwoSecondBlog',
          createdAt: expect.any(String),
          isMembership: false,
        },
        {
          id: expect.any(String),
          name: 'userTwoFirst',
          description: 'userTwoFirstBlog test description',
          websiteUrl: 'https://www.youtube.com/userTwoFirstBlog',
          createdAt: expect.any(String),
          isMembership: false,
        },
      ],
    });

    // ERROR
    await request(app.getHttpServer())
      .get(`/blogger/blogs`)
      .set('Authorization', `Bearer dfsdfsdfsdfsdaf`)
      .send({
        name: 'userTwoSecond',
        description: 'userTwoSecondBlog test description',
        websiteUrl: 'https://www.youtube.com/userTwoSecondBlog',
      })
      .expect(401);
  });
  it('PUT BLOG', async () => {
    // UPDATE FIRST BLOG USER ONE
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogIdOwnUserOne}`)
      .send({
        name: 'updateBlog',
        description: 'updateBlog description',
        websiteUrl: 'https://www.youtube.com/updateBlog',
      })
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(204);
    // GET THREE BLOG USER ONE | FIRST BLOG SHOULD BEEN UPDATE
    const foundBlogs = await request(app.getHttpServer())
      .get(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    expect(foundBlogs.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [
        {
          id: expect.any(String),
          name: 'thirdBlog',
          description: 'thirdBlog description',
          websiteUrl: 'https://www.youtube.com/thirdBlog',
          createdAt: expect.any(String),
          isMembership: false,
        },
        {
          id: expect.any(String),
          name: 'secondBlog',
          description: 'secondBlog description',
          websiteUrl: 'https://www.youtube.com/secondBlog',
          createdAt: expect.any(String),
          isMembership: false,
        },
        {
          id: expect.any(String),
          name: 'updateBlog',
          description: 'updateBlog description',
          websiteUrl: 'https://www.youtube.com/updateBlog',
          createdAt: expect.any(String),
          isMembership: false,
        },
      ],
    });
    // ERRORS
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogIdOwnUserOne}`)
      .send({
        name: 'updateBlog',
        description: 'updateBlog description',
        websiteUrl: 'https://www.youtube.com/updateBlog',
      })
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(403);

    const errorMessages = await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogIdOwnUserOne}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        name: 'userTwoSecondqweqweqweqwe',
        description: 1,
      })
      .expect(400);
    expect(errorMessages.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'name must be shorter than or equal to 15 characters',
        },
        {
          field: 'description',
          message:
            'description must be shorter than or equal to 500 characters',
        },
        {
          field: 'websiteUrl',
          message:
            'websiteUrl must match ^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$ regular expression',
        },
      ],
    });
  });
  it('DELETE BLOG', async () => {
    // DELETE FIRST BLOG USER TWO
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogIdOwnUserTwo}`)
      .send({
        name: 'updateBlog',
        description: 'updateBlog description',
        websiteUrl: 'https://www.youtube.com/updateBlog',
      })
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(204);
    // GET ONE BLOG USER TWO | FIRST BLOG SHOULD BEEN DELETED
    const foundBlogs = await request(app.getHttpServer())
      .get(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(200);
    expect(foundBlogs.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          name: 'userTwoSecond',
          description: 'userTwoSecondBlog test description',
          websiteUrl: 'https://www.youtube.com/userTwoSecondBlog',
          createdAt: expect.any(String),
          isMembership: false,
        },
      ],
    });
    // ERRORS
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogIdOwnUserTwo}`)
      .send({
        name: 'updateBlog',
        description: 'updateBlog description',
        websiteUrl: 'https://www.youtube.com/updateBlog',
      })
      .set('Authorization', `Bearer 122121`)
      .expect(401);
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogIdOwnUserOne}`)
      .send({
        name: 'updateBlog',
        description: 'updateBlog description',
        websiteUrl: 'https://www.youtube.com/updateBlog',
      })
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogIdOwnUserTwo}`)
      .send({
        name: 'updateBlog',
        description: 'updateBlog description',
        websiteUrl: 'https://www.youtube.com/updateBlog',
      })
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(404);
  });
  it('CREATE THREE POSTS BY BLOG ID', async () => {
    // CREATE THREE POSTS USER ONE
    let newPost = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        title: 'firstPost title',
        shortDescription: 'firstPost Description',
        content: 'firstPost content',
      })
      .expect(201);
    postIdOwnUserOne = newPost.body.id;
    expect(newPost.body).toEqual({
      id: expect.any(String),
      blogId: blogIdOwnUserOne,
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

    newPost = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        title: 'secondPost title',
        shortDescription: 'secondPost Description',
        content: 'secondPost content',
      })
      .expect(201);
    secondPostIdOwnUserOne = newPost.body.id;

    newPost = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        title: 'thirdPost title',
        shortDescription: 'thirdPost Description',
        content: 'thirdPost content',
      })
      .expect(201);
    // ERRORS
    const errorMessages = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
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
      .post(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .send({
        title: 'thirdPost title',
        shortDescription: 'thirdPost Description',
        content: 'thirdPost content',
      })
      .expect(401);

    await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({
        title: 'thirdPost title',
        shortDescription: 'thirdPost Description',
        content: 'thirdPost content',
      })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/blogger/blogs/${123}/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        title: 'thirdPost title',
        shortDescription: 'thirdPost Description',
        content: 'thirdPost content',
      })
      .expect(404);
  });
  it('GET POSTS BY BLOG ID', async () => {
    // GET THREE POSTS USER ONE
    const foundPosts = await request(app.getHttpServer())
      .get(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    // TO EQUAL FIRST BLOG
    expect(foundPosts.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [
        {
          id: expect.any(String),
          blogId: blogIdOwnUserOne,
          blogName: 'updateBlog',
          title: 'thirdPost title',
          shortDescription: 'thirdPost Description',
          createdAt: expect.any(String),
          content: 'thirdPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          blogId: blogIdOwnUserOne,
          blogName: 'updateBlog',
          title: 'secondPost title',
          shortDescription: 'secondPost Description',
          createdAt: expect.any(String),
          content: 'secondPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          blogId: blogIdOwnUserOne,
          blogName: 'updateBlog',
          title: 'firstPost title',
          shortDescription: 'firstPost Description',
          createdAt: expect.any(String),
          content: 'firstPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ],
    });

    // ERROR
    await request(app.getHttpServer())
      .get(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .expect(401);
    await request(app.getHttpServer())
      .get(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/blogger/blogs/${123}/posts`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(404);
  });
  it('PUT POST BY BLOG ID', async () => {
    // UPDATE FIRST BLOG USER ONE
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogIdOwnUserOne}/posts/${postIdOwnUserOne}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(204);

    // GET THREE POSTS USER ONE
    const foundPosts = await request(app.getHttpServer())
      .get(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    // TO EQUAL FIRST BLOG
    expect(foundPosts.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [
        {
          id: expect.any(String),
          blogId: blogIdOwnUserOne,
          blogName: 'updateBlog',
          title: 'thirdPost title',
          shortDescription: 'thirdPost Description',
          createdAt: expect.any(String),
          content: 'thirdPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          blogId: blogIdOwnUserOne,
          blogName: 'updateBlog',
          title: 'secondPost title',
          shortDescription: 'secondPost Description',
          createdAt: expect.any(String),
          content: 'secondPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          blogId: blogIdOwnUserOne,
          blogName: 'updateBlog',
          title: 'stri1ng',
          shortDescription: 'string',
          createdAt: expect.any(String),
          content:
            'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ],
    });
    // ERRORS
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogIdOwnUserOne}/posts/${postIdOwnUserOne}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .expect(401);
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogIdOwnUserOne}/posts/${postIdOwnUserOne}`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .expect(403);
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${123}/posts/${postIdOwnUserOne}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .expect(404);
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogIdOwnUserOne}/posts/${123}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .expect(404);
  });
  it('DELETE POST BY BLOG ID', async () => {
    // DELETE FIRST POST USER ONE
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogIdOwnUserOne}/posts/${postIdOwnUserOne}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(204);

    // GET TWO POSTS USER ONE
    const foundPosts = await request(app.getHttpServer())
      .get(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    // TO EQUAL FIRST BLOG
    expect(foundPosts.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: expect.any(String),
          blogId: blogIdOwnUserOne,
          blogName: 'updateBlog',
          title: 'thirdPost title',
          shortDescription: 'thirdPost Description',
          createdAt: expect.any(String),
          content: 'thirdPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: expect.any(String),
          blogId: blogIdOwnUserOne,
          blogName: 'updateBlog',
          title: 'secondPost title',
          shortDescription: 'secondPost Description',
          createdAt: expect.any(String),
          content: 'secondPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ],
    });

    // ERROR
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogIdOwnUserOne}/posts/${postIdOwnUserOne}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .expect(401);
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogIdOwnUserOne}/posts/${postIdOwnUserOne}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${404}/posts/${postIdOwnUserOne}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogIdOwnUserOne}/posts/${404}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/blogger/blogs/${404}/posts/${404}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(404);
  });
  /////////////////////////////    SUPER ADMIN     /////////////////////////////
  it('GET BLOG', async () => {
    // GET ALL BLOGS
    const foundBlogs = await request(app.getHttpServer())
      .get(`/sa/blogs`)
      .auth('admin', 'qwerty')
      .expect(200);
    // TO EQUAL FIRST BLOG
    expect(foundBlogs.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        {
          id: expect.any(String),
          name: 'userTwoSecond',
          description: 'userTwoSecondBlog test description',
          websiteUrl: 'https://www.youtube.com/userTwoSecondBlog',
          createdAt: expect.any(String),
          isMembership: false,
          blogOwnerInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
        },
        {
          id: expect.any(String),
          name: 'thirdBlog',
          description: 'thirdBlog description',
          websiteUrl: 'https://www.youtube.com/thirdBlog',
          createdAt: expect.any(String),
          isMembership: false,
          blogOwnerInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
        },
        {
          id: expect.any(String),
          name: 'secondBlog',
          description: 'secondBlog description',
          websiteUrl: 'https://www.youtube.com/secondBlog',
          createdAt: expect.any(String),
          isMembership: false,
          blogOwnerInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
        },
        {
          id: expect.any(String),
          name: 'updateBlog',
          description: 'updateBlog description',
          websiteUrl: 'https://www.youtube.com/updateBlog',
          createdAt: expect.any(String),
          isMembership: false,
          blogOwnerInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
        },
      ],
    });

    // ERROR
    await request(app.getHttpServer()).get(`/sa/blogs`).expect(401);
  });
  it('CREATE AND DELETE USER', async () => {
    // CREATE USER
    const createdUser = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'testUser',
        password: 'testUser',
        email: 'testUser@gg.com',
      })
      .expect(201);
    expect(createdUser.body).toEqual({
      id: expect.any(String),
      login: 'testUser',
      email: 'testUser@gg.com',
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });
    // ERRORS CREATE
    const errorsMessages = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'testUser',
        password: 'testUser',
        email: 'testUser@gg.com',
      })
      .expect(400);
    expect(errorsMessages.body).toEqual({
      errorsMessages: [
        { message: 'login exist', filed: 'login' },
        { message: 'email exist', filed: 'email' },
      ],
    });

    await request(app.getHttpServer())
      .post('/sa/users')
      .send({
        login: 'testUser',
        password: 'testUser',
        email: 'testUser@gg.com',
      })
      .expect(401);

    // DELETE USER
    await request(app.getHttpServer())
      .delete(`/sa/users/${createdUser.body.id}`)
      .auth('admin', 'qwerty')
      .expect(204);

    // ERRORS DELETE
    await request(app.getHttpServer())
      .delete(`/sa/users/${createdUser.body.id}`)
      .auth('admin', 'qwerty')
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/sa/users/${createdUser.body.id}`)
      .expect(401);
  });
  it('GET USERS', async () => {
    // GET ALL USERS
    const foundUsers = await request(app.getHttpServer())
      .get(`/sa/users`)
      .auth('admin', 'qwerty')
      .expect(200);

    expect(foundUsers.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: expect.any(String),
          login: 'qwertyb',
          email: 'bbb@yandex.ru',
          createdAt: expect.any(String),
          banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null,
          },
        },
        {
          id: expect.any(String),
          login: 'qwertya',
          email: 'aaa@yandex.ru',
          createdAt: expect.any(String),
          banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null,
          },
        },
      ],
    });

    // ERROR
    await request(app.getHttpServer()).get(`/sa/blogs`).expect(401);
  });
  it('||| REPARATION ||| CREATE COMMENTS AND LIKES', async () => {
    // user 2 create post
    const postOwnerUserTwo = await request(app.getHttpServer())
      .post(`/blogger/blogs/${secondBlogIdOwnUserTwo}/posts`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({
        title: 'firstPost title',
        shortDescription: 'firstPost Description',
        content: 'firstPost content',
      })
      .expect(201);
    postIdOwnerUserTwo = postOwnerUserTwo.body.id;
    /////CREATE COMMENTS////
    // User one create 2 comments in second post
    const com1 = await request(app.getHttpServer())
      .post(`/posts/${secondPostIdOwnUserOne}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ content: 'user one first comment' })
      .expect(201);
    const com2 = await request(app.getHttpServer())
      .post(`/posts/${secondPostIdOwnUserOne}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ content: 'user one second Comment' })
      .expect(201);
    // user two create two comment in second post
    const com3 = await request(app.getHttpServer())
      .post(`/posts/${secondPostIdOwnUserOne}/comments`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ content: 'user two first comment' })
      .expect(201);
    const com4 = await request(app.getHttpServer())
      .post(`/posts/${secondPostIdOwnUserOne}/comments`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ content: 'user two second comment' })
      .expect(201);

    // User one create two comments in 2 post
    const com5 = await request(app.getHttpServer())
      .post(`/posts/${postOwnerUserTwo.body.id}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ content: 'user one first comment' })
      .expect(201);
    const com6 = await request(app.getHttpServer())
      .post(`/posts/${postOwnerUserTwo.body.id}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ content: 'user one second Comment' })
      .expect(201);
    // user two create two comment in second post
    const com7 = await request(app.getHttpServer())
      .post(`/posts/${postOwnerUserTwo.body.id}/comments`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ content: 'user two first comment' })
      .expect(201);
    const com8 = await request(app.getHttpServer())
      .post(`/posts/${postOwnerUserTwo.body.id}/comments`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ content: 'user two second comment' })
      .expect(201);

    /////CREATE LIKES////
    // LIKE/DISLIKE 1 POST
    // user 1
    await request(app.getHttpServer())
      .put(`/comments/${com1.body.id}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com2.body.id}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com3.body.id}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com4.body.id}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    // user 2
    await request(app.getHttpServer())
      .put(`/comments/${com1.body.id}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com2.body.id}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com3.body.id}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com4.body.id}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    // LIKE/DISLIKE 2 POST
    // user 1
    await request(app.getHttpServer())
      .put(`/comments/${com5.body.id}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com6.body.id}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com7.body.id}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com8.body.id}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    // user 2
    await request(app.getHttpServer())
      .put(`/comments/${com5.body.id}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com6.body.id}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com7.body.id}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
    await request(app.getHttpServer())
      .put(`/comments/${com8.body.id}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);
  });
  it('||| REPARATION ||| GET COMMENTS AND LIKES', async () => {
    const commentsPostOne = await request(app.getHttpServer())
      .get(`/posts/${secondPostIdOwnUserOne}/comments`)
      .expect(200);
    expect(commentsPostOne.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        {
          id: expect.any(String),
          content: 'user two second comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user two first comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user one second Comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user one first comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
      ],
    });
    const commentsPostTwo = await request(app.getHttpServer())
      .get(`/posts/${postIdOwnerUserTwo}/comments`)
      .expect(200);
    expect(commentsPostTwo.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        {
          id: expect.any(String),
          content: 'user two second comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user two first comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user one second Comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user one first comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
      ],
    });
  });
  it('BAN USER', async () => {
    let commentsPostTwo = await request(app.getHttpServer())
      .get(`/posts/${postIdOwnerUserTwo}/comments`)
      .expect(200);
    expect(commentsPostTwo.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        {
          id: expect.any(String),
          content: 'user two second comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user two first comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user one second Comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user one first comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertya',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
      ],
    });
    const com1Id = commentsPostTwo.body.items[0].id;
    const com2Id = commentsPostTwo.body.items[1].id;
    const com3Id = commentsPostTwo.body.items[2].id;
    const com4Id = commentsPostTwo.body.items[3].id;

    // BAN ONE USER
    await request(app.getHttpServer())
      .put(`/sa/users/${userOne.id}/ban`)
      .send({
        isBanned: true,
        banReason: 'stringstringstringst',
      })
      .auth('admin', 'qwerty')
      .expect(204);

    await request(app.getHttpServer()).get(`/comments/${com3Id}`).expect(404);
    const foundComment = await request(app.getHttpServer())
      .get(`/comments/${com1Id}`)
      .expect(200);
    expect(foundComment.body).toEqual({
      id: expect.any(String),
      content: 'user two second comment',
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: 'qwertyb',
      },
      createdAt: expect.any(String),
      likesInfo: { likesCount: 1, dislikesCount: 1, myStatus: 'None' },
    });

    commentsPostTwo = await request(app.getHttpServer())
      .get(`/posts/${postIdOwnerUserTwo}/comments`)
      .expect(200);
    expect(commentsPostTwo.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [
        {
          id: expect.any(String),
          content: 'user two second comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
        {
          id: expect.any(String),
          content: 'user two first comment',
          commentatorInfo: {
            userId: expect.any(String),
            userLogin: 'qwertyb',
          },
          createdAt: expect.any(String),
          likesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: 'None',
          },
        },
      ],
    });

    // ERROR
    await request(app.getHttpServer())
      .put(`/sa/users/${userOne.id}/ban`)
      .send({
        isBanned: true,
        banReason: 'stringstringstringst',
      })
      .expect(401);
  });
});
