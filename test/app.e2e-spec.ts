import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
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
  login: 'qwertyc',
  password: 'qwertyc',
  email: 'ccc@yandex.ru',
  id: null,
  accessToken: null,
};
const userFour = {
  login: 'qwertyd',
  password: 'qwertyd',
  email: 'ddd@yandex.ru',
  id: null,
  accessToken: null,
};

let postId: any;
let postSecondId: any;
let thirdPostId: any;

let blogId: any;

let commentId: string;

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
      .post('/users')
      .auth('admin', 'qwerty')
      .send(userOne)
      .expect(201);
    userOne.id = response.body.id;

    // USER 2
    response = await request(app.getHttpServer())
      .post('/users')
      .auth('admin', 'qwerty')
      .send(userTwo)
      .expect(201);
    userTwo.id = response.body.id;

    // USER 3
    response = await request(app.getHttpServer())
      .post('/users')
      .auth('admin', 'qwerty')
      .send(userThree)
      .expect(201);
    userThree.id = response.body.id;

    // USER 4
    response = await request(app.getHttpServer())
      .post('/users')
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
  it('CREATE BLOG -> THREE POST ', async () => {
    // CREATE NEW BLOG
    const blog = await request(app.getHttpServer())
      .post(`/blogs`)
      .auth('admin', 'qwerty')
      .send({
        name: 'testBlog',
        description:
          'testBlog description testBlog description  testBlog test description',
        websiteUrl: 'https://www.youtube.com/testBlog',
      })
      .expect(201);

    blogId = blog.body.id;

    // CREATE POSTS
    const post = await request(app.getHttpServer())
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'it test test post',
        blogId: blog.body.id,
        content: 'test post content',
        shortDescription: 'shortDescription test post',
      })
      .expect(201);

    expect(post.body).toEqual({
      id: post.body.id,
      createdAt: expect.any(String),
      blogName: 'testBlog',
      title: 'it test test post',
      blogId: blog.body.id,
      content: 'test post content',
      shortDescription: 'shortDescription test post',
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    // CREATE SECOND POSTS VIA ENDPOINT BLOG
    const postSecond = await request(app.getHttpServer())
      .post(`/blogs/${blog.body.id}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'it test test post',
        blogId: blog.body.id,
        content: 'test post content',
        shortDescription: 'shortDescription test post',
      })
      .expect(201);

    expect(postSecond.body).toEqual({
      id: postSecond.body.id,
      createdAt: expect.any(String),
      blogName: 'testBlog',
      title: 'it test test post',
      blogId: blog.body.id,
      content: 'test post content',
      shortDescription: 'shortDescription test post',
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    const thirdPost = await request(app.getHttpServer())
      .post(`/blogs/${blog.body.id}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'it thirdPost test post',
        blogId: blog.body.id,
        content: 'test thirdPost content',
        shortDescription: 'shortDescription test thirdPost',
      })
      .expect(201);

    postId = post.body.id;
    postSecondId = postSecond.body.id;
    thirdPostId = thirdPost.body.id;
  });
  /////////////////////////////    BLOG FLOW    /////////////////////////////////////////
  it('BLOG', async () => {
    const firstBlog = {
      name: 'firstBlog',
      description:
        'firstBlog description firstBlog description  firstBlog test description',
      websiteUrl: 'https://www.youtube.com/firstBlog',
    };
    const secondBlog = {
      name: 'secondBlog',
      description:
        'secondBlog test description secondBlog test description test description',
      websiteUrl: 'https://www.youtube.com/secondBlog',
    };

    // CREATE NEW BLOG
    const newBlog = await request(app.getHttpServer())
      .post(`/blogs`)
      .auth('admin', 'qwerty')
      .send(firstBlog)
      .expect(201);

    // TO EQUAL NEW BLOG
    expect(newBlog.body).toEqual({
      id: expect.any(String),
      createdAt: expect.any(String),
      description: firstBlog.description,
      isMembership: false,
      name: firstBlog.name,
      websiteUrl: firstBlog.websiteUrl,
    });

    //GET BLOG BY ID
    const getBlog = await request(app.getHttpServer())
      .get(`/blogs/${newBlog.body.id}`)
      .expect(200);
    // TO EQUAL GOT BLOG
    expect(getBlog.body).toEqual({
      id: newBlog.body.id,
      createdAt: newBlog.body.createdAt,
      description: newBlog.body.description,
      isMembership: newBlog.body.isMembership,
      name: newBlog.body.name,
      websiteUrl: newBlog.body.websiteUrl,
    });

    // CREATE SECOND BLOG
    await request(app.getHttpServer())
      .post(`/blogs`)
      .auth('admin', 'qwerty')
      .send(secondBlog)
      .expect(201);

    // GET ALL BLOGS
    const getAllBlog = await request(app.getHttpServer())
      .get(`/blogs?sortBy=createdAt&pageNumber=1&pageSize=10`)
      .expect(200);
    expect(getAllBlog.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [
        {
          id: expect.any(String),
          createdAt: expect.any(String),
          description: secondBlog.description,
          isMembership: false,
          name: secondBlog.name,
          websiteUrl: secondBlog.websiteUrl,
        },
        {
          id: newBlog.body.id,
          createdAt: newBlog.body.createdAt,
          description: newBlog.body.description,
          isMembership: newBlog.body.isMembership,
          name: newBlog.body.name,
          websiteUrl: newBlog.body.websiteUrl,
        },
        {
          id: expect.any(String),
          createdAt: expect.any(String),
          description:
            'testBlog description testBlog description  testBlog test description',
          isMembership: false,
          name: 'testBlog',
          websiteUrl: 'https://www.youtube.com/testBlog',
        },
      ],
    });

    // UPDATE FIRST BLOG
    await request(app.getHttpServer())
      .put(`/blogs/${newBlog.body.id}`)
      .auth('admin', 'qwerty')
      .send({
        name: 'updateBlog',
        description: 'description updateBlog',
        websiteUrl: 'https://updateBlog.ru',
      })
      .expect(204);

    const updateBlog = await request(app.getHttpServer())
      .get(`/blogs/${newBlog.body.id}`)
      .expect(200);
    // TO EQUAL UPDATE BLOG
    expect(updateBlog.body).toEqual({
      id: newBlog.body.id,
      createdAt: newBlog.body.createdAt,
      description: 'description updateBlog',
      isMembership: newBlog.body.isMembership,
      name: 'updateBlog',
      websiteUrl: 'https://updateBlog.ru',
    });

    // DELETE SECOND BLOG
    // await request(app).delete(`/blogs/${}`)

    // ERRORS
    const errorBlog = await request(app.getHttpServer())
      .post(`/blogs`)
      .auth('admin', 'qwerty')
      .send({
        name: 1,
        description: 1,
        websiteUrl: 1,
      })
      .expect(400);
    expect(errorBlog.body).toEqual({
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
      .post(`/blogs`)
      .send({
        name: 1,
        description: 1,
        websiteUrl: 1,
      })
      .expect(401);
  });
  /////////////////////////////    ENDPOINT [POST] FLOW    /////////////////////////////////////////
  it('CREATE COMMENTS', async () => {
    const createdComment = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ content: 'stringstringstringst' })
      .expect(201);
    expect(createdComment.body).toEqual({
      id: expect.any(String),
      content: 'stringstringstringst',
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: 'qwertya',
      },
      createdAt: expect.any(String),
      likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
    });

    commentId = createdComment.body.id;

    // ERRORS
    await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .send({ content: 'stringstringstringst' })
      .expect(401);
    await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ content: 1 })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/posts/${9999999999999}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ content: `stringstringstringst` })
      .expect(404);
  });
  it('GET POSTS AND COMMENTS', async () => {
    // GET ALL POSTS WITHOUT TOKEN
    let allPosts = await request(app.getHttpServer()).get(`/posts`).expect(200);
    expect(allPosts.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [
        {
          id: thirdPostId,
          blogId: blogId,
          blogName: 'testBlog',
          title: 'it thirdPost test post',
          shortDescription: 'shortDescription test thirdPost',
          createdAt: expect.any(String),
          content: 'test thirdPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: postSecondId,
          blogId: blogId,
          blogName: 'testBlog',
          title: 'it test test post',
          shortDescription: 'shortDescription test post',
          createdAt: expect.any(String),
          content: 'test post content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: postId,
          blogId: blogId,
          blogName: 'testBlog',
          title: 'it test test post',
          shortDescription: 'shortDescription test post',
          createdAt: expect.any(String),
          content: 'test post content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ],
    });

    // GET ALL POSTS WITH TOKEN
    allPosts = await request(app.getHttpServer())
      .get(`/posts`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    expect(allPosts.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [
        {
          id: thirdPostId,
          blogId: blogId,
          blogName: 'testBlog',
          title: 'it thirdPost test post',
          shortDescription: 'shortDescription test thirdPost',
          createdAt: expect.any(String),
          content: 'test thirdPost content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: postSecondId,
          blogId: blogId,
          blogName: 'testBlog',
          title: 'it test test post',
          shortDescription: 'shortDescription test post',
          createdAt: expect.any(String),
          content: 'test post content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
        {
          id: postId,
          blogId: blogId,
          blogName: 'testBlog',
          title: 'it test test post',
          shortDescription: 'shortDescription test post',
          createdAt: expect.any(String),
          content: 'test post content',
          extendedLikesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        },
      ],
    });

    // GET POST BY ID WITHOUT TOKEN
    let foundPost = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .expect(200);
    expect(foundPost.body).toEqual({
      id: postId,
      blogId: blogId,
      blogName: 'testBlog',
      title: 'it test test post',
      shortDescription: 'shortDescription test post',
      createdAt: expect.any(String),
      content: 'test post content',
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    // GET POST BY ID WITH TOKEN
    foundPost = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    expect(foundPost.body).toEqual({
      id: postId,
      blogId: blogId,
      blogName: 'testBlog',
      title: 'it test test post',
      shortDescription: 'shortDescription test post',
      createdAt: expect.any(String),
      content: 'test post content',
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    // GET COMMENTS BY ID POST WITH TOKEN
    let foundComments = await request(app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    expect(foundComments.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          content: 'stringstringstringst',
          commentatorInfo: {
            userId: userOne.id,
            userLogin: userOne.login,
          },
          createdAt: expect.any(String),
          likesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
          },
        },
      ],
    });

    // GET COMMENTS BY ID POST WITHOUT TOKEN
    foundComments = await request(app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .expect(200);
    expect(foundComments.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          content: 'stringstringstringst',
          commentatorInfo: {
            userId: userOne.id,
            userLogin: userOne.login,
          },
          createdAt: expect.any(String),
          likesInfo: {
            dislikesCount: 0,
            likesCount: 0,
            myStatus: 'None',
          },
        },
      ],
    });

    // ERRORS
    await request(app.getHttpServer()).get(`/posts/${1}`).expect(404);
    await request(app.getHttpServer()).get(`/posts/${1}/comments`).expect(404);
  });
  it('PUT AND DELETE POST ', async () => {
    const post = await request(app.getHttpServer())
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        title: 'it test test post',
        blogId: blogId,
        content: 'test post content',
        shortDescription: 'shortDescription test post',
      })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/posts/${post.body.id}`)
      .auth('admin', 'qwerty')
      .send({
        title: 'it test test post UPDATE',
        blogId: blogId,
        content: 'test post content UPDATE',
        shortDescription: 'shortDescription test post UPDATE',
      })
      .expect(204);

    // GET POST BY ID WITHOUT TOKEN
    const foundPost = await request(app.getHttpServer())
      .get(`/posts/${post.body.id}`)
      .expect(200);
    expect(foundPost.body).toEqual({
      id: post.body.id,
      blogId: blogId,
      blogName: 'testBlog',
      title: 'it test test post UPDATE',
      shortDescription: 'shortDescription test post UPDATE',
      createdAt: expect.any(String),
      content: 'test post content UPDATE',
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    // DELETE POST
    await request(app.getHttpServer())
      .delete(`/posts/${post.body.id}`)
      .auth('admin', 'qwerty')
      .expect(204);

    // ERRORS
    await request(app.getHttpServer()).delete(`/posts/${postId}`).expect(401);
    await request(app.getHttpServer())
      .delete(`/posts/${1}`)
      .auth('admin', 'qwerty')
      .expect(404);
    await request(app.getHttpServer())
      .put(`/posts/${post.body.id}`)
      .auth('admin', 'qwerty')
      .send({
        title: 'it test test post UPDATE',
        blogId: blogId,
        content: 'test post content UPDATE',
        shortDescription: 'shortDescription test post UPDATE',
      })
      .expect(404);
    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .send({
        title: 'it test test post UPDATE',
        blogId: blogId,
        content: 'test post content UPDATE',
        shortDescription: 'shortDescription test post UPDATE',
      })
      .expect(401);
    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth('admin', 'qwerty')
      .send({
        title: 'it test test post UPDATE',
        blogId: 1,
        content: 'test post content UPDATE',
        shortDescription: 'shortDescription test post UPDATE',
      })
      .expect(400);
    await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth('admin', 'qwerty')
      .send({
        title: 3,
        blogId: blogId,
        content: 2,
        shortDescription: 1,
      })
      .expect(400);
  });
  /////////////////////////////    ENDPOINT [COMMENTS] FLOW    //////////////////////////////////////
  it('GET COMMENTS', async () => {
    // GET COMMENT BY ID WITHOUT TOKEN
    const comment = await request(app.getHttpServer())
      .get(`/comments/${commentId}`)
      .expect(200);
    expect(comment.body).toEqual({
      id: commentId,
      content: 'stringstringstringst',
      commentatorInfo: {
        userId: userOne.id,
        userLogin: userOne.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
    // GET COMMENT BY ID WITH TOKEN
    await request(app.getHttpServer())
      .get(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);
    expect(comment.body).toEqual({
      id: commentId,
      content: 'stringstringstringst',
      commentatorInfo: {
        userId: userOne.id,
        userLogin: userOne.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });
  /////////////////////////////    POST LIKE FLOW    /////////////////////////////////////////
  it('ERROR 400 / 404', async () => {
    // PUSH LIKE | comment id incorrect | SHOULD RETURN 404
    await request(app.getHttpServer())
      .put(`/posts/${111}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(404);

    // PUSH LIKE | status incorrect | SHOULD RETURN 401
    const error = await request(app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Likee' })
      .expect(400);

    expect(error.body).toEqual({
      errorsMessages: [
        {
          message:
            'likeStatus must be one of the following values: None, Like, Dislike',
          field: 'likeStatus',
        },
      ],
    });
  });
  it('PUT 2 LIKE AND 2 DISLIKE IN FIRST POST', async () => {
    await request(app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .set('Authorization', `Bearer ${userThree.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .set('Authorization', `Bearer ${userFour.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);
  });
  it('GET LIKE STATUS FIRST POST', async () => {
    // FIRST USER GET COMMENT | SHOULD RETURN 2 LIKE 2 DISLIKE AND MY STATUS `Like`
    const post = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);

    expect(post.body).toEqual({
      id: postId,
      content: 'test post content',
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      shortDescription: 'shortDescription test post',
      title: 'it test test post',
      extendedLikesInfo: {
        likesCount: 2,
        dislikesCount: 2,
        myStatus: 'Like',
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: expect.any(String),
          },
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: expect.any(String),
          },
        ],
      },
    });
  });
  it('PUT 4 LIKE IN SECOND POST AND GET LIKE STATUS', async () => {
    await request(app.getHttpServer())
      .put(`/posts/${postSecondId}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/posts/${postSecondId}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/posts/${postSecondId}/like-status`)
      .set('Authorization', `Bearer ${userThree.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    await request(app.getHttpServer())
      .put(`/posts/${postSecondId}/like-status`)
      .set('Authorization', `Bearer ${userFour.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    const post = await request(app.getHttpServer())
      .get(`/posts/${postSecondId}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);

    expect(post.body).toEqual({
      id: postSecondId,
      content: 'test post content',
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      shortDescription: 'shortDescription test post',
      title: 'it test test post',
      extendedLikesInfo: {
        likesCount: 4,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: userFour.id,
            login: userFour.login,
          },
          {
            addedAt: expect.any(String),
            userId: userThree.id,
            login: userThree.login,
          },
          {
            addedAt: expect.any(String),
            userId: userTwo.id,
            login: userTwo.login,
          },
        ],
      },
    });
  });
  it('PUT 2 DISLIKE AND 1 LIKE IN THIRD POST | GET POST AFTER EACH LIKE', async () => {
    await request(app.getHttpServer())
      .put(`/posts/${thirdPostId}/like-status`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    let post = await request(app.getHttpServer())
      .get(`/posts/${thirdPostId}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);

    expect(post.body).toEqual({
      id: thirdPostId,
      content: 'test thirdPost content',
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      shortDescription: 'shortDescription test thirdPost',
      title: 'it thirdPost test post',
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: 'Dislike',
        newestLikes: [],
      },
    });

    await request(app.getHttpServer())
      .put(`/posts/${thirdPostId}/like-status`)
      .set('Authorization', `Bearer ${userTwo.accessToken}`)
      .send({ likeStatus: 'Dislike' })
      .expect(204);

    post = await request(app.getHttpServer())
      .get(`/posts/${thirdPostId}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);

    expect(post.body).toEqual({
      id: thirdPostId,
      content: 'test thirdPost content',
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      shortDescription: 'shortDescription test thirdPost',
      title: 'it thirdPost test post',
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 2,
        myStatus: 'Dislike',
        newestLikes: [],
      },
    });

    await request(app.getHttpServer())
      .put(`/posts/${thirdPostId}/like-status`)
      .set('Authorization', `Bearer ${userThree.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(204);

    post = await request(app.getHttpServer())
      .get(`/posts/${thirdPostId}`)
      .set('Authorization', `Bearer ${userOne.accessToken}`)
      .expect(200);

    expect(post.body).toEqual({
      id: thirdPostId,
      content: 'test thirdPost content',
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      shortDescription: 'shortDescription test thirdPost',
      title: 'it thirdPost test post',
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 2,
        myStatus: 'Dislike',
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: expect.any(String),
          },
        ],
      },
    });
  });
  /////////////////////////////    DEVICES SESSION    /////////////////////////////////////////
  it('DELETE ALL DATA', async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  }, 100000);
  it('CREATE TWO USERS', async () => {
    // USER 1
    let response = await request(app.getHttpServer())
      .post('/users')
      .auth('admin', 'qwerty')
      .send(userOne)
      .expect(201);
    userOne.id = response.body.id;

    // USER 2
    response = await request(app.getHttpServer())
      .post('/users')
      .auth('admin', 'qwerty')
      .send(userTwo)
      .expect(201);
    userTwo.id = response.body.id;
  });
  it('LOGIN FIRST USER FROM 4 DIFFERENT DEVICES AND USER SECOND USER ONE DEV', async () => {
    // first user login | google home
    let response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'google home')
      .send({
        loginOrEmail: userOne.email,
        password: userOne.password,
      })
      .expect(200);
    userOne.refreshToken = response.headers['set-cookie'][0];

    // first user login | android
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'android')
      .send({
        loginOrEmail: userOne.email,
        password: userOne.password,
      })
      .expect(200);

    // first user login | iPhone
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'iPhone')
      .send({
        loginOrEmail: userOne.email,
        password: userOne.password,
      })
      .expect(200);

    // first user login | FoxFire
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'FoxFire')
      .send({
        loginOrEmail: userOne.email,
        password: userOne.password,
      })
      .expect(200);
    userOne.accessToken = response.body.accessToken;

    // second user login | FoxFire
    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: userTwo.email,
        password: userTwo.password,
      })
      .expect(200);
    userTwo.refreshToken = response.headers['set-cookie'][0];
  });
  it(`GET DEVICES`, async () => {
    // GET 4 DEVICES
    let foundDevices = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', userOne.refreshToken)
      .expect(200);
    expect(foundDevices.body).toEqual([
      {
        ip: '::ffff:127.0.0.1',
        title: 'google home',
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
      {
        ip: '::ffff:127.0.0.1',
        title: 'android',
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
      {
        ip: '::ffff:127.0.0.1',
        title: 'iPhone',
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
      {
        ip: '::ffff:127.0.0.1',
        title: 'FoxFire',
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
    ]);

    foundDevices = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', userTwo.refreshToken)
      .expect(200);
    expect(foundDevices.body).toEqual([
      {
        ip: '::ffff:127.0.0.1',
        title: 'someDevice',
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
    ]);
  });
  it(`DELETE DEVICES`, async () => {
    // GET 4 DEVICES | userOne
    let foundDevices = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', userOne.refreshToken)
      .expect(200);

    // DELETE DEVICES BY ID | userOne
    await request(app.getHttpServer())
      .delete(`/security/devices/${foundDevices.body[3].deviceId}`)
      .set('Cookie', userOne.refreshToken)
      .expect(204);

    // GET 3 DEVICES | userOne
    foundDevices = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', userOne.refreshToken)
      .expect(200);
    expect(foundDevices.body).toEqual([
      {
        ip: '::ffff:127.0.0.1',
        title: 'google home',
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
      {
        ip: '::ffff:127.0.0.1',
        title: 'android',
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
      {
        ip: '::ffff:127.0.0.1',
        title: 'iPhone',
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
    ]);
    // DELETE ALL OTHER DEVICES | userOne
    await request(app.getHttpServer())
      .delete(`/security/devices`)
      .set('Cookie', userOne.refreshToken)
      .expect(204);
    // GET 1 DEVICES | userOne
    foundDevices = await request(app.getHttpServer())
      .get('/security/devices')
      .set('Cookie', userOne.refreshToken)
      .expect(200);
    expect(foundDevices.body).toEqual([
      {
        ip: '::ffff:127.0.0.1',
        title: `google home`,
        deviceId: expect.any(String),
        lastActiveDate: expect.any(String),
      },
    ]);
  });
  /////////////////////////////    AUTH   ///////////////////////////////////////////////////
  it('REFRESH TOKEN AND LOGOUT', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', userTwo.refreshToken)
      .expect(200);
    expect(
      response.headers['set-cookie'][0] === userTwo.refreshToken,
    ).toBeFalsy();

    await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', userTwo.refreshToken)
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', response.headers['set-cookie'][0])
      .expect(204);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', response.headers['set-cookie'][0])
      .expect(401);
  });
});
