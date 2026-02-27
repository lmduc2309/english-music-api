import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import User from '../../models/User';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private signToken(id: string) {
    return this.jwtService.sign({ id });
  }

  private formatUser(user: any) {
    return {
      id: user._id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      currentLevel: user.currentLevel,
      totalXP: user.totalXP,
      currentStreak: user.currentStreak,
      songsCompleted: user.songsCompleted,
      averageScore: user.averageScore,
    };
  }

  async register(dto: RegisterDto) {
    const exists = await User.findOne({ $or: [{ email: dto.email }, { username: dto.username }] });
    if (exists) throw new ConflictException('Email or username already exists');
    const user = await User.create(dto);
    const token = this.signToken(user._id as string);
    return { token, user: this.formatUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await User.findOne({ email: dto.email }).select('+password');
    if (!user || !(await user.comparePassword(dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = this.signToken(user._id as string);
    return { token, user: this.formatUser(user) };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new UnauthorizedException('User not found');
    return { user };
  }
}
