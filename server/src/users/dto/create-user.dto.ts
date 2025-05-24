import { IsEmail, IsMobilePhone, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({message:"FullName is required."})
    @IsString({message:"FullName must be string."})
    fullName:string;

    @IsNotEmpty({message:"Email is required."})
    @IsEmail()
    email:string;

    @IsNotEmpty({message:"Password is required."})
    @MinLength(3,{message:"password is 3"})
    password:string;

    @IsNotEmpty({message:"Password confirmation is required."})
    @MinLength(3,{message:"password confirmation is 3"})
    passwordConfirm:string;

    
    @IsOptional()
    @IsMobilePhone("ar-DZ")
    phone:string
}
