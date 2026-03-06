import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const { password, refreshToken, ...profile } = user;
    return profile;
  }

  async update(userId: string, updateDto: UpdateUserDto) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, updateDto);
    return this.userRepository.save(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userRepository.update(userId, { refreshToken: hashed });
  }

  async updateStreak(userId: string) {
    const user = await this.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastPractice = user.lastPracticeDate
      ? new Date(user.lastPracticeDate)
      : null;

    if (lastPractice) {
      lastPractice.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        user.currentStreak += 1;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }

    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    user.lastPracticeDate = today;
    await this.userRepository.save(user);
  }

  async addXp(userId: string, xp: number) {
    await this.userRepository.increment({ id: userId }, 'totalXp', xp);
  }
}
