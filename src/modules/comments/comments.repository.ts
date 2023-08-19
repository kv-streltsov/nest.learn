import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comments } from './comments.schena';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comments.name) private commentsModel: Model<Comments>,
  ) {}
  async createComment(createCommentDto: any) {
    return this.commentsModel.create(createCommentDto);
  }
  async updateComment(commentId: string, content: string) {
    return this.commentsModel.updateOne(
      { id: commentId },
      { $set: { content: content } },
    );
  }
  async deleteComment(commentId: string) {
    return this.commentsModel.deleteOne({ id: commentId });
  }
}
