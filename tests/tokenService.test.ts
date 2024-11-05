import { TokenService } from "../core/auth/tokenService";
import { personel } from "@prisma/client";
import { RefreshTokenRepositoryImplMock } from "../core/auth/refreshTokenRepositoryImplMock";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { describe, expect, it } from "vitest";
import { beforeEach } from "node:test";

// Mock configuration
const config = {
  jwtSecret: "some_secret",
  accessTokenExpiration: "1h",
  refreshTokenExpiration: "7d",
  encryptionKey: crypto.randomBytes(32),
  ivLength: 16,
};

// Mock personnel data
const mockUser: personel = {
  id: 1,
  first_name: "Test",
  last_name: "User",
  email: "",
  password: "password123",
  role_id: 1,
  created_at: new Date(),
  updated_at: new Date(),
  phone_number: "1234567890",
};

// Mock refresh token repository
const refreshTokenRepository = new RefreshTokenRepositoryImplMock(
  "mockRefreshToken"
);

// Create an instance of TokenService
const tokenService = new TokenService(refreshTokenRepository, config);

// Test Suite for TokenService
describe("TokenService", () => {
  describe("generateAccessToken", () => {
    beforeEach(() => {
      config.jwtSecret = "testsecret";
    });

    it("should generate a valid access token", async () => {
      const accessToken = await tokenService.generateAccessToken(
        mockUser,
        "testAudience"
      );
      expect(accessToken).toBeDefined();
    });

    it("should throw an error if JWT secret is not set", async () => {
      // Arange
      const configWithoutSecret = { ...config };
      configWithoutSecret.jwtSecret = "";
      const tokenServiceWithoutSecret = new TokenService(
        refreshTokenRepository,
        configWithoutSecret
      );

      // Act
      const result = () =>
        tokenServiceWithoutSecret.generateAccessToken(mockUser, "testAudience");

      // Assert
      await expect(result).rejects.toThrow("JWT secret not set");
    });

    it("should throw an error if audience is not set", async () => {
      await expect(
        tokenService.generateAccessToken(mockUser, "")
      ).rejects.toThrow("Audience not set");
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", async () => {
      const refreshToken = await tokenService.generateRefreshToken(
        mockUser,
        "testAudience"
      );
      expect(refreshToken).toBeDefined();
    });

    it("should throw an error if JWT secret is not set", async () => {
      // Arange
      const configWithoutSecret = { ...config };
      configWithoutSecret.jwtSecret = "";
      const tokenServiceWithoutSecret = new TokenService(
        refreshTokenRepository,
        configWithoutSecret
      );

      await expect(
        tokenServiceWithoutSecret.generateRefreshToken(mockUser, "testAudience")
      ).rejects.toThrow("JWT secret not set");
    });
  });

  describe("validateAccessToken", () => {
    it("should validate a valid access token", async () => {
      const accessToken = await tokenService.generateAccessToken(
        mockUser,
        "testAudience"
      );
      const tokenPayload = await tokenService.validateAccessToken(
        accessToken,
        "testAudience"
      );
      expect(tokenPayload).toBeDefined();
      expect(tokenPayload?.sub).toBe(mockUser.id.toString());
    });

    it("should return null for an invalid access token", async () => {
      const tokenPayload = await tokenService.validateAccessToken(
        "invalidToken",
        "testAudience"
      );
      expect(tokenPayload).toBeNull();
    });
  });

  describe("validateRefreshToken", () => {
    it("should validate a valid refresh token", async () => {
      // Arange
      const refreshToken = await tokenService.generateRefreshToken(
        mockUser,
        "testAudience"
      );
      const refreshTokenRepository = new RefreshTokenRepositoryImplMock(
        refreshToken
      );
      const tokenServiceWithActualToken = new TokenService(
        refreshTokenRepository,
        config
      );

      const tokenPayload =
        await tokenServiceWithActualToken.validateRefreshToken(
          refreshToken,
          "testAudience"
        );
      console.log("tokenPayload", tokenPayload);
      expect(tokenPayload).toBeTruthy();

      expect(tokenPayload?.sub).toBe(mockUser.id.toString());
    });

    it("should invalidate a valid refresh token when audience is different", async () => {
      // Arange
      const refreshToken = await tokenService.generateRefreshToken(
        mockUser,
        "testAudience"
      );
      const refreshTokenRepository = new RefreshTokenRepositoryImplMock(
        refreshToken
      );
      const tokenServiceWithActualToken = new TokenService(
        refreshTokenRepository,
        config
      );

      const tokenPayload =
        await tokenServiceWithActualToken.validateRefreshToken(
          refreshToken,
          "1234"
        );
      console.log("tokenPayload", tokenPayload);
      expect(tokenPayload).toBeNull();
    });

    it("should return null for an invalid refresh token", async () => {
      const tokenPayload = await tokenService.validateRefreshToken(
        "invalidToken",
        "testAudience"
      );
      expect(tokenPayload).toBeNull();
    });
  });

  describe("saveRefreshToken", () => {
    it("should save a refresh token without throwing an error", async () => {
      await expect(
        tokenService.saveRefreshToken(mockUser.id, "mockRefreshToken")
      ).resolves.toBeUndefined();
    });
  });

  describe("getRefreshToken", () => {
    it("should return the stored refresh token", async () => {
      const refreshToken = await tokenService.getRefreshToken(mockUser.id);
      expect(refreshToken).toBe("mockRefreshToken");
    });
  });

  describe("deleteRefreshToken", () => {
    it("should delete the refresh token", async () => {
      await tokenService.deleteRefreshToken(mockUser.id);
      const refreshToken = await tokenService.getRefreshToken(mockUser.id);
      expect(refreshToken).toBeNull();
    });
  });

  describe("encryptToken and decryptToken", () => {
    it("should encrypt and decrypt a token successfully", async () => {
      const token = "testToken";
      const encryptedToken = await tokenService["encryptToken"](token);
      expect(encryptedToken).toBeDefined();

      const decryptedToken = await tokenService["decryptToken"](encryptedToken);
      expect(decryptedToken).toBe(token);
    });

    it("should throw an error for invalid encrypted token format", async () => {
      await expect(
        tokenService["decryptToken"]("invalidTokenFormat")
      ).rejects.toThrow("Invalid encrypted token format");
    });
  });
});
