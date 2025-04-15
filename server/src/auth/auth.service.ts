import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from 'src/users/users.schema';
import { Model } from 'mongoose';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) { }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto
    const user = await this.usersModel.findOne({ email })
    if (!user) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage('Invalid email or password !')
      )
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage('Invalid email or password !')
      )
    }

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('User Created successfully')
      .setData(user)
      .build()
  }


}
