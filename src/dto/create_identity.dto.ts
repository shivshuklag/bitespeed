import {
  IsOptional,
  IsString,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'EitherEmailOrPhone', async: false })
class EitherEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    return !!(obj.email || obj.phoneNumber); // at least one must be present
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either email or phoneNumber must be provided.';
  }
}

export class CreateIdentityDto {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Invalid Indian phone number. Must be 10 digits starting with 6-9',
  })
  phoneNumber?: string;

  @Validate(EitherEmailOrPhoneConstraint)
  private readonly _eitherEmailOrPhoneCheck: string;
}
