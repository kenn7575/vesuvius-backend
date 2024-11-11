import { personel } from "@prisma/client";

interface Locals {
  message?: string;
  userId?: number;
  roleId?: number;
}
declare global {
  namespace Express {
    export interface Request {
      user?: personel;
    }
    export interface Response {
      locals: Locals;
    }
  }
}
