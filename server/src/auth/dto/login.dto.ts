import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: "Email is required." })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: "Password is required." })
    @MinLength(3, { message: "password is 3" })
    password: string;
}
