import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikesEntity } from '../../likes.entity';
import { Repository } from 'typeorm';
@Injectable()
export class LikesSqlRepository {
  constructor(
    @InjectRepository(LikesEntity)
    private readonly likesSqlRepository: Repository<LikesEntity>,
  ) {}
  async createLikeStatus(
    entityId: string,
    userId: string,
    status: string,
    addedAt: string,
  ) {
    return this.likesSqlRepository.query(
      `INSERT INTO public.likes(
                "entityId", "userId", status, "addedAt")
                VALUES ($1, $2, $3, $4);`,
      [entityId, userId, status, addedAt],
    );
  }

  async deleteLike(entityId: string) {
    return this.likesSqlRepository.query(
      `DELETE FROM public.likes
                    WHERE "entityId" = '${entityId}'`,
    );
  }

  async updateLike(
    userId: string,
    entityId: string,
    status: string,
    addedAt: string,
  ) {
    return this.likesSqlRepository.query(
      `UPDATE public.likes
                SET  status=$1, "addedAt"=$2
                WHERE "userId"= $4 AND "entityId" = '$5'`,
      [status, addedAt, userId, entityId],
    );
  }
}
