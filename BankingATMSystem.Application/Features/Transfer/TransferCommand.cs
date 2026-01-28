using BankingATMSystem.Application.Common.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Transfer
{
    public class TransferCommand : IRequest<string>, IIdempotent
    {
        public string SenderId {  get; set; }
        public string requestId { get; set; }
        public string ReceiverAccountNumber { get; set; }
        public decimal AmountMoney { get; set; }
        public string Pin { get; set; }
        public string Content { get; set; }
        public string Types { get; set; }
        public string Description { get; set; }
    }
}
