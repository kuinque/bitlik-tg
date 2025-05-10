from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

@dataclass
class Transaction:
    id: int
    type: str  # 'send' or 'receive'
    amount: float
    from_user: Optional[str] = None
    to_user: Optional[str] = None
    date: datetime = datetime.now()
    status: str = 'completed'

@dataclass
class Wallet:
    balance: float
    currency: str
    transactions: List[Transaction]

    @classmethod
    def from_dict(cls, data: dict) -> 'Wallet':
        transactions = [
            Transaction(
                id=t['id'],
                type=t['type'],
                amount=t['amount'],
                from_user=t.get('from'),
                to_user=t.get('to'),
                date=datetime.fromisoformat(t['date']),
                status=t['status']
            )
            for t in data['transactions']
        ]
        return cls(
            balance=data['balance'],
            currency=data['currency'],
            transactions=transactions
        ) 