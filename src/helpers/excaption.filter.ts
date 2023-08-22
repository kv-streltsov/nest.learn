import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class TestExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse: any = exception.getResponse();
    if (errorResponse.message === `Unexpected end of JSON input`) {
      // @ts-ignore
      response.status(status).json({
        errorsMessages: [
          {
            message: `Unexpected end of JSON input`,
            field: `body`,
          },
        ],
      });
      return;
    }

    if (status === 400) {
      if (errorResponse.message === `email exist`) {
        // @ts-ignore
        response.status(status).json({
          errorsMessages: [
            {
              message: errorResponse.message,
              field: `email`,
            },
          ],
        });
        return;
      }
      if (errorResponse.message === `login exist`) {
        // @ts-ignore
        response.status(status).json({
          errorsMessages: [
            {
              message: errorResponse.message,
              field: `login`,
            },
          ],
        });
        return;
      }
      if (errorResponse.message === `Bad Request`) {
        // @ts-ignore
        response.status(status).json();
        return;
      }
      if (errorResponse.message === `wrong code confirm`) {
        // @ts-ignore
        response.status(status).json({
          errorsMessages: [
            {
              message: errorResponse.message,
              field: `code`,
            },
          ],
        });
        return;
      }
      if (errorResponse.message === `wrong email confirm`) {
        // @ts-ignore
        response.status(status).json({
          errorsMessages: [
            {
              message: errorResponse.message,
              field: `email`,
            },
          ],
        });
        return;
      }
    }
    if (status === 401) {
      // @ts-ignore
      return response.status(status).json();
    }
    if (status === 403) {
      // @ts-ignore
      return response.status(status).json();
    }
    if (status === 404) {
      // @ts-ignore
      return response.status(status).json();
    }

    try {
      // @ts-ignore
      response.status(status).json({
        errorsMessages: errorResponse.message,
      });
      return;
    } catch (err) {
      // @ts-ignore
      response.status(status).json({
        errorsMessages: `err`,
      });
    }
  }
}
