import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RessetPasswordDto {
    @IsNotEmpty({ message: "Email is required." })
    @IsEmail()
    email: string;

}
