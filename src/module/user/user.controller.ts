import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '@thallesp/nestjs-better-auth';
import { UserService } from './user.service';

// Authentication is enforced by the AuthGuard that AuthModule registers
// globally; @Roles adds the role check on top of it.
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // Declared before ':id' so 'all' is not captured as an id.
    @Get('all')
    @Roles(['ADMIN'])
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }
}
