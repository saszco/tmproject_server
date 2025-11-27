import jwt from "jsonwebtoken";
import { Token } from "../models/tokenModel.js";

class TokenService {
  generateTokens(payload: any) {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)
      return;

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token: string) {
    if (!process.env.JWT_ACCESS_SECRET) return;
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    if (!process.env.JWT_REFRESH_SECRET) return;
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (error) {
      return null;
    }
  }

  async saveToken(userId: string, refreshToken: string) {
    const tokenData = await Token.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }

    const token = await Token.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken: string) {
    await Token.deleteOne({ refreshToken });
  }

  async findToken(refreshToken: string) {
    const tokenData = await Token.findOne({ refreshToken });
    return tokenData;
  }
}

export const tokenService = new TokenService();
