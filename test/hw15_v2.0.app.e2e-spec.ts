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
const userThree = {
  login: 'qwe',
  password: 'leqweqweqweqwq',
  email: 'somdffailq@qewfee.com',
  id: null,
  accessToken: null,
  refreshToken: `null`,
};
const userFour = {
  login: 'sad',
  password: 'leqweqweqweqwq',
  email: 'asd@qewfee.com',
  id: null,
  accessToken: null,
  refreshToken: `null`,
};

let blogIdOwnUserOne: any;
let blogIdOwnUserTwo: any;

let postIdOwnUserOne: any;
let secondBlogIdOwnUserTwo: any;

let secondPostIdOwnUserOne: any;
let postIdOwnerUserTwo: any;

let com1ownerUser1: any;
let com2ownerUser1: any;
let com3ownerUser2: any;
let com4ownerUser2: any;

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
  it('CREATE FOUR USERS', async () => {
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
    });

    // USER 2
    response = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(userTwo)
      .expect(201);
    userTwo.id = response.body.id;

    // USER 3
    response = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(userThree)
      .expect(201);
    userThree.id = response.body.id;

    // USER 4
    response = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(userFour)
      .expect(201);
    userFour.id = response.body.id;
  });

  it('LOGIN FOUR USERS | should return JWT Pair ', async () => {
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
    // LOGIN USER 3
    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: userThree.email,
        password: userThree.password,
      })
      .expect(200);
    userThree.accessToken = response.body.accessToken;
    // LOGIN USER 4
    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: userFour.email,
        password: userFour.password,
      })
      .expect(200);
    userFour.accessToken = response.body.accessToken;
  });
  /////////////////////////////    BLOGGER FLOW    /////////////////////////////////////////

  /// BLOGS
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
    // GET THREE BLOG USER ONE
    const foundBlog = await request(app.getHttpServer())
      .get(`/blogs/${blogIdOwnUserTwo}`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(200);
    // TO EQUAL FIRST BLOG
    expect(foundBlog.body).toEqual({
      id: expect.any(String),
      name: 'userTwoFirst',
      description: 'userTwoFirstBlog test description',
      websiteUrl: 'https://www.youtube.com/userTwoFirstBlog',
      createdAt: expect.any(String),
      isMembership: false,
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
    await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogIdOwnUserTwo}`)
      .send({
        name: 'updateBlog',
        description: 'updateBlog description',
        websiteUrl: 'https://www.youtube.com/updateBlog',
      })
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .expect(404);
  });

  /// POSTS
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
    // await request(app.getHttpServer())
    //   .get(`/blogger/blogs/${blogIdOwnUserOne}/posts`)
    //   .set('Authorization', `Bearer ${userTwo.accessToken}`)
    //   .expect(403);
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
      .delete(`/posts/${postIdOwnUserOne}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .auth('admin', 'qwerty')
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
      .delete(`/posts/${postIdOwnUserOne}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .expect(401);

    await request(app.getHttpServer())
      .delete(`/${404}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .auth('admin', 'qwerty')
      .expect(404);
  });
  it('POST BLOG -> POST POST -> GET -> DELETE POSTS -> DELETE BLOG', async () => {
    // CREATE THREE BLOG USER ONE
    const newBlog = await request(app.getHttpServer())
      .post(`/blogger/blogs`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        name: 'firstBlog',
        description: 'firstBlog description',
        websiteUrl: 'https://www.youtube.com/firstBlog',
      })
      .expect(201);
    const newPost = await request(app.getHttpServer())
      .post(`/blogger/blogs/${newBlog.body.id}/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({
        title: 'firstPost title',
        shortDescription: 'firstPost Description',
        content: 'firstPost content',
      })
      .expect(201);
    await request(app.getHttpServer())
      .get(`/posts/${newPost.body.id}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/posts/${newPost.body.id}`)
      .send({
        title: 'stri1ng',
        shortDescription: 'string',
        content:
          'https://www.youtube.com/watch?v=92DnDZ_Lp9A&ab_channel=%E1%95%88S%C9%8ESUB',
      })
      .auth('admin', 'qwerty')
      .expect(204);
    await request(app.getHttpServer())
      .get(`/posts/${newPost.body.id}`)

      .expect(404);
  });
});
