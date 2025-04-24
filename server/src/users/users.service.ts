import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './users.schema';
import { Model, Types } from 'mongoose';
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

    if (createUserDto.password !== createUserDto.passwordConfirm) {
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

  async findAll() {
    return await this.usersModel.find();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage(`المعرف ${id} غير صالح`)
          .setErrors({ _id: 'Invalid ObjectId format' })
          .build(),
      );
    }

    const user = await this.usersModel.findOne({ _id: id });

    if (!user) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على السائق ذو المعرف #${id}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }
    return user
  }

  async update(id: string, updateChauffeurDto: UpdateUserDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage(`المعرف ${id} غير صالح`)
          .setErrors({ _id: 'Invalid ObjectId format' })
          .build(),
      );
    }

    const operateur = await this.usersModel.findByIdAndUpdate(
      id,
      { $set: updateChauffeurDto },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!operateur) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على السائق ذو المعرف #${id}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم تحديث السائق بنجاح!')
      .setData(operateur)
      .build();
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
