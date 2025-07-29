import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: "Email is required." })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: "Password is required." })
    @MinLength(3, { message: "password is 3" })
    password: string;
}


export class ChangeRessetPassword {
    @IsNotEmpty({ message: "Email is required." })
    @IsEmail()
    email: string;
    
    @IsNotEmpty({ message: "Password is required." })
    @MinLength(3, { message: "password is 3" })
    password: string;

    @IsNotEmpty({ message: "Confirme Password is required." })
    @MinLength(3, { message: "Confirme Password is 3" })
    ConfirmePassword: string;
}

