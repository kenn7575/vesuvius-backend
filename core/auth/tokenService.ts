import jwt, { JwtPayload } from "jsonwebtoken";
import configFile from "../../config/config";
import { personel } from "@prisma/client";
import IRefreshTokenRepository from "./IRefreshTokenRepository";
import crypto from "crypto";

export class TokenService {
  private refreshTokenRepository: IRefreshTokenRepository;
  private config: any;

  constructor(
    refreshTokenRepository: IRefreshTokenRepository,
    customConfig?: any
  ) {
    this.refreshTokenRepository = refreshTokenRepository;

    this.config = customConfig || configFile;
  }

  async generateAccessToken(user: personel, audience: string): Promise<string> {
    if (!this.config.jwtSecret) {
      throw new Error("JWT secret not set");
    }
    if (!audience || audience === "") {
      throw new Error("Audience not set");
    }

    const { password, ...userWithoutPassword } = user;

    const token = jwt.sign(userWithoutPassword, this.config.jwtSecret, {
      algorithm: "HS256",
      expiresIn: this.config.accessTokenExpiration,
      subject: user.id.toString(),
      audience,
    });

    // encrypt token;
    const encryptedToken = await this.encryptToken(token);

    return encryptedToken;
  }

  async generateRefreshToken(
    user: personel,
    audience: string
  ): Promise<string> {
    if (!this.config.jwtSecret) {
      throw new Error("JWT secret not set");
    }

    const { password, ...userWithoutPassword } = user;

    const token = jwt.sign(userWithoutPassword, this.config.jwtSecret, {
      algorithm: "HS256",
      expiresIn: this.config.refreshTokenExpiration,
      subject: user.id.toString(),
      audience,
    });

    // encrypt token
    const encryptedToken = await this.encryptToken(token);

    // create in database
    this.saveRefreshToken(user.id, encryptedToken);

    return encryptedToken;
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    await this.refreshTokenRepository.saveRefreshToken(userId, token);
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    return this.refreshTokenRepository.getRefreshToken(userId);
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    await this.refreshTokenRepository.deleteRefreshToken(userId);
  }

  async validateAccessToken(
    encryptedToken: string,
    audience: string
  ): Promise<jwt.JwtPayload | null> {
    // steps:
    // 1. decrypt token
    // 2. basic validation of token
    // 3. compare audience

    try {
      // 1. decrypt token
      const decryptedToken = await this.decryptToken(encryptedToken);

      // 2. basic validation of token
      if (!this.config.jwtSecret) {
        throw new Error("JWT secret not set");
      }
      const token = jwt.verify(
        decryptedToken,
        this.config.jwtSecret
      ) as jwt.JwtPayload;

      // 3. compare audience
      if (token.aud !== audience) {
        throw new Error("Invalid audience");
      }

      return token;
    } catch (error) {
      console.error("Invalid token", (typeof error).toString(), error);
      return null;
    }
  }

  async validateRefreshToken(
    encryptedToken: string,
    audience: string
  ): Promise<JwtPayload | null> {
    // steps:
    // 1. decrypt token
    // 2. basic validation of token
    // 3. compare audience
    // 4. get stored token
    // 5. compare stored token with token

    try {
      // 1. decrypt token
      const decryptedToken = await this.decryptToken(encryptedToken);

      // 2. basic validation of token
      if (!this.config.jwtSecret) {
        throw new Error("JWT secret not set");
      }
      const token = jwt.verify(
        decryptedToken,
        this.config.jwtSecret
      ) as jwt.JwtPayload;

      // 3. compare audience
      if (token.aud !== audience) {
        throw new Error("Invalid audience");
      }

      // 4. get stored token
      const userId = Number(token.sub);
      const storedToken = await this.getRefreshToken(userId);

      // 5. compare stored token with token
      if (!storedToken || storedToken !== encryptedToken) {
        await this.deleteRefreshToken(userId);
        return null;
      }
      return token;
    } catch (error) {
      console.error("Invalid token", (typeof error).toString(), error);

      return null;
    }
  }

  private async encryptToken(token: string): Promise<string> {
    if (!this.config.encryptionKey) {
      throw new Error("Encryption key not set");
    }
    if (!this.config.ivLength) {
      throw new Error("IV length not set");
    }

    const iv = crypto.randomBytes(Number(this.config.ivLength));
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      this.config.encryptionKey,
      iv
    );
    let encrypted = cipher.update(token, "utf8", "base64");
    encrypted += cipher.final("base64");
    return `${iv.toString("base64")}:${encrypted}`;
  }

  private async decryptToken(encryptedToken: string): Promise<string> {
    if (!this.config.encryptionKey) {
      throw new Error("Encryption key not set");
    }

    const [ivString, encrypted] = encryptedToken.split(":");
    if (!ivString || !encrypted) {
      throw new Error("Invalid encrypted token format");
    }
    const iv = Buffer.from(ivString, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.config.encryptionKey,
      iv
    );
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
