declare global {
  namespace Express {
    interface Locals {
      userId: number;
      roleId: number;
    }
  }
}
import { Request, Response } from "express";
interface Locals extends Record<string, any> {
  userId: number;
}
interface MyResponse extends Response {
  locals: Locals;
}
export function middleware(request: Request, response: MyResponse) {
  const { userId } = response.locals;
  response.end(userId);
  return userId;
}
