export interface BaseVo<T = unknown> {
  code: string;
  message: string;
  data: T;
}
