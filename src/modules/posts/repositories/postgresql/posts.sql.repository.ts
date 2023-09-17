import { Injectable } from '@nestjs/common';
import {
  ICreateModifiedPostDto,
  CreatePostInBlogDto,
} from '../../dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from '../../posts.entity';

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postSqlRepository: Repository<PostsEntity>,
  ) {}
  async createPost(createPostDto: ICreateModifiedPostDto) {
    return this.postSqlRepository.query(
      `
        INSERT INTO public.posts(
            id,"blogId", title, "blogName", "shortDescription", content, "createdAt")
             VALUES ( $1, $2, $3, $4, $5, $6,$7)`,
      [
        createPostDto.id,
        createPostDto.blogId,
        createPostDto.title,
        createPostDto.blogName,
        createPostDto.shortDescription,
        createPostDto.content,
        createPostDto.createdAt,
      ],
    );
  }
  updatePost(postId: string, updatePostDto: CreatePostInBlogDto) {
    return this.postSqlRepository.query(
      `UPDATE public.posts
                SET title=$1, content=$2, "shortDescription"=$3
                WHERE id= $4`,
      [
        updatePostDto.title,
        updatePostDto.content,
        updatePostDto.shortDescription,
        postId,
      ],
    );
  }
  async deletePost(postId: string) {
    const deletedPost = await this.postSqlRepository.query(
      `DELETE FROM public.posts WHERE id = $1`,
      [postId],
    );
    if (!deletedPost[1]) return null;
    return true;
  }
}
