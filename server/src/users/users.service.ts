import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './users.schema';
import { Model } from 'mongoose';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) { }

  async create(createUserDto: CreateUserDto) {
    const emailExisting = await this.emailValidator(createUserDto.email);
    console.log(emailExisting);

    if (emailExisting) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage('Email Already exist !')
      )
    }

    if(createUserDto.password !== createUserDto.passwordConfirm){
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage('password not match !')
      )
    }
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    createUserDto.password = hash
    await this.usersModel.create(createUserDto)

    return new ResponseBuilder()
              .setStatus(200)
              .setMessage('User Created successfully')
              .build()
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async emailValidator(email: string) {
    console.log(email);
    const em = await this.usersModel.findOne({ email }).exec()
    console.log(em);

    return em
  }
}
