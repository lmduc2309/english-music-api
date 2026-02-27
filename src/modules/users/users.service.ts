import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import User from '../../models/User';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await User.findByIdAndUpdate(userId, { $set: dto }, { new: true, runValidators: true }).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Profile updated successfully', user };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await user.comparePassword(dto.currentPassword);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');
    user.password = dto.newPassword;
    await user.save();
    return { message: 'Password changed successfully' };
  }

  async getStats(userId: string) {
    const user = await User.findById(userId).select(
      'totalXP currentStreak longestStreak songsCompleted sentencesPracticed averageScore currentLevel lastPracticeDate'
    );
    if (!user) throw new NotFoundException('User not found');
    return { stats: user };
  }
}
