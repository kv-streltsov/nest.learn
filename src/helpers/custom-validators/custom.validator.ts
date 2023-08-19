import { BlogsQueryRepository } from '../../modules/blogs/blogs.query.repository';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'custom', async: false })
@Injectable()
export class CustomValidator implements ValidatorConstraintInterface {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async validate(value: any, args: ValidationArguments) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(value);

    if (foundBlog !== null) {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    // Custom error message to be displayed when validation fails
    return 'blog not found';
  }
}

export function isBlogExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBlogExist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: CustomValidator,
    });
  };
}
