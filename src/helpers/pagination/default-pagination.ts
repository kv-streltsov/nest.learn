import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class DefaultPagination {
  @Transform(({ value }) => {
    if (!value) return 1;
    const valToInt = parseInt(value, 10);
    if (isNaN(valToInt)) return 1;
    if (valToInt <= 0) return 1;
    return valToInt;
  })
  @IsOptional()
  pageNumber = 1;
  @Transform(({ value }) => {
    if (!value) return 10;
    const valToInt = parseInt(value, 10);
    if (isNaN(valToInt)) return 10;
    if (valToInt <= 0) return 10;
    return valToInt;
  })
  @IsOptional()
  pageSize = 10;
  @IsString()
  @IsOptional()
  sortBy = 'createdAt';
  @Transform(({ value }) => {
    return value === 'asc' ? 'asc' : 'desc';
  })
  @IsOptional()
  sortDirection: 'asc' | 'desc' = 'desc';

  skip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export class UsersPagination extends DefaultPagination {
  @IsString()
  @IsOptional()
  searchLoginTerm = '';

  @IsString()
  @IsOptional()
  searchEmailTerm = '';
}
