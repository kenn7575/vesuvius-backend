export default interface IRefreshTokenRepository {
  saveRefreshToken(userId: number, token: string): Promise<void>;
  getRefreshToken(userId: number): Promise<string | null>;
  deleteRefreshToken(userId: number): Promise<void>;
}
