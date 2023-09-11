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
  it('CREATE 12 USERS', async () => {
    // USER 1
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'loSer', email: 'email2p@gg.om', password: 'qewrqwer' })
      .expect(201);

    // USER 2
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'log01', email: 'emai@gg.com', password: 'qewrqwer' })
      .expect(201);

    // USER 3
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'log02', email: 'email2p@g.com', password: 'qewrqwer' })
      .expect(201);

    // USER 4
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'uer15', email: 'emarrr1@gg.com', password: 'qewrqwer' })
      .expect(201);

    // USER 5
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'user01', email: 'email1p@gg.cm', password: 'qewrqwer' })
      .expect(201);

    // USER 6
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'user02', email: 'email1p@gg.com', password: 'qewrqwer' })
      .expect(201);

    // USER 7
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'user03', email: 'email1p@gg.cou', password: 'qewrqwer' })
      .expect(201);

    // USER 8
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'user05', email: 'email1p@gg.coi', password: 'qewrqwer' })
      .expect(201);

    // USER 9
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'usr-1-01', email: 'email3@gg.com', password: 'qewrqwer' })
      .expect(201);

    // USER 10
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'log03', email: 'emailp@g.com', password: 'qewrqwer' })
      .expect(201);

    // USER 11
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'vvv', email: 'ccc@xx.xxx', password: 'qewrqwer' })
      .expect(201);

    // USER 12
    await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: 'ccc', email: 'vvv@xx.xxx', password: 'qewrqwer' })
      .expect(201);
  });

  /////////////////////////////    BLOGGER FLOW    /////////////////////////////////////////
});
