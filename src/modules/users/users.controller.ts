import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateDto);
  }
}
