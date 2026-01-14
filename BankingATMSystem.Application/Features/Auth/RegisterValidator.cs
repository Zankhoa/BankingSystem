using FluentValidation;


namespace BankingATMSystem.Application.Features.Auth
{
    public class RegisterValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterValidator() 
        {
            //ten nguoi dung
            RuleFor(x => x.Username).NotEmpty().WithMessage("ten tai khoan khong dc de trong")
                .Matches("^[a-zA-Z]$").WithMessage("Ten khong duoc chua ky tu dac biet va so");
            ////so dien thoai
            //RuleFor(x => x.PhoneNumber).NotEmpty().WithMessage("Sdt khong dc de trong")
            //    .Length(10).WithMessage("Chỉ duoc 10 so")
            //    .Matches("^[0-9]{10}$").WithMessage("Chỉ duoc nhap so khong duoc nhap ky tu");
            //mat khau
            RuleFor(x => x.Password).NotEmpty().WithMessage("Khong duoc bo trong mat khau")
                .MinimumLength(8).WithMessage("mat khau phai co it nhat 8 ki tu")
                .Matches("[A-Z]").WithMessage("Phải có ít nhất 1 chữ hoa")
                .Matches("[a-z]").WithMessage("Phải có ít nhất 1 chữ thường")
                .Matches("[0-9]").WithMessage("Phải có ít nhất 1 số")
                .Matches("[^a-zA-Z0-9]").WithMessage("Phải có ít nhất 1 ký tự đặc biệt (!@#...)");
            //email
            RuleFor(x => x.Email)
                .NotEmpty().EmailAddress().WithMessage("Email khong hop le");
        }
    }
}
