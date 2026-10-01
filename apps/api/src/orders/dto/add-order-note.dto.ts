import { IsString, MaxLength, MinLength } from "class-validator";

export class AddOrderNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  note: string;
}
