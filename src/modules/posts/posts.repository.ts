import { Injectable } from '@nestjs/common';
import { ICreateModifiedPostDto, CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posts } from './posts.schena';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Posts.name) private postsModel: Model<Posts>) {}
  createPost(createPostDto: ICreateModifiedPostDto) {
    return this.postsModel.create(createPostDto);
  }
  updatePost(postId: string, updatePostDto: CreatePostDto) {
    return this.postsModel.updateOne(
      { id: postId },
      {
        $set: {
          title: updatePostDto.title,
          shortDescription: updatePostDto.shortDescription,
          content: updatePostDto.content,
          blogId: updatePostDto.blogId,
        },
      },
    );
  }
  deletePost(postId: string) {
    return this.postsModel.deleteOne({ id: postId });
  }
}
