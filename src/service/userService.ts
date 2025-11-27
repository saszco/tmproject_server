import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import { mailService } from "./mailService.js";
import { tokenService } from "./tokenService.js";
import UserDto from "../dtos/userDto.js";
import ApiError from "../exceptions/apiError.js";

class UserService {
  async registration(email: string, password: string) {
    const candidate = await User.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} exists`);
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = v4();
    const user = await User.create({
      email,
      password: hashPassword,
      activationLink,
    });
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    if (!tokens) return;

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async activate(activationLink: string) {
    const user = await User.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Unknown activation link");
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("User with this email is not found");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest("Not correct password");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    if (!tokens) return;
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError;
    }
    const user = await User.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    if (!tokens) return;
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }
}

export const userService = new UserService();
