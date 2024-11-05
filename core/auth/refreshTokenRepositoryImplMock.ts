import { PrismaClient } from "@prisma/client";
import IRefreshTokenRepository from "./IRefreshTokenRepository";

// Example implementation of IRefreshTokenRepository using Prisma

export class RefreshTokenRepositoryImplMock implements IRefreshTokenRepository {
  public mockToken: string | null;

  constructor(mockToken: string) {
    this.mockToken = mockToken;
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {}

  async getRefreshToken(userId: number): Promise<string | null> {
    return this.mockToken;
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    this.mockToken = null;
  }
}
