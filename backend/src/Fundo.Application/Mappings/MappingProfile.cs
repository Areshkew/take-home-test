using AutoMapper;
using Fundo.Application.DTOs;
using Fundo.Domain.Entities;

namespace Fundo.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Loan, LoanDto>();
        CreateMap<Payment, PaymentDto>();
    }
}
