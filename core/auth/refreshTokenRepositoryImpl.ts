import { PrismaClient } from "@prisma/client";
import IRefreshTokenRepository from "./IRefreshTokenRepository";

// Example implementation of IRefreshTokenRepository using Prisma

export class RefreshTokenRepositoryImpl implements IRefreshTokenRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    await this.prisma.refresh_tokens.upsert({
      where: { id: Number(userId) },
      update: { token },
      create: { user_id: userId, token },
    });
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    const refreshToken = await this.prisma.refresh_tokens.findUnique({
      where: { user_id: userId },
    });
    return refreshToken ? refreshToken.token : null;
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    await this.prisma.refresh_tokens.delete({
      where: { user_id: userId },
    });
  }
}
