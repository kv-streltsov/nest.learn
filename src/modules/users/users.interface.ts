export interface ICreateUserInDto {
  login: string;
  password: string;
  email: string;
}

export interface ICreateUserModifiedDto {
  login: string;
  password: string;
  email: string;
  createdAt: string;
}

export interface IUserView {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export enum SortType {
  asc = 1,
  desc = -1,
}
export enum SortBanStatus {
  all = ` all`,
  banned = `banned`,
  notBanned = `notBanned`,
}
