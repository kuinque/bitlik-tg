from typing import List, Dict, Any
from ..models.wallet import Wallet, Transaction
from config.config import MOCK_USER_DATA

class WalletService:
    def __init__(self):
        self._wallet = Wallet.from_dict(MOCK_USER_DATA)

    def get_balance(self) -> Dict[str, Any]:
        return {
            "balance": self._wallet.balance,
            "currency": self._wallet.currency
        }

    def get_transactions(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": t.id,
                "type": t.type,
                "amount": t.amount,
                "from": t.from_user,
                "to": t.to_user,
                "date": t.date.isoformat(),
                "status": t.status
            }
            for t in self._wallet.transactions
        ]

    def send_money(self, amount: float, to_user: str) -> bool:
        if amount > self._wallet.balance:
            return False
        
        self._wallet.balance -= amount
        self._wallet.transactions.append(
            Transaction(
                id=len(self._wallet.transactions) + 1,
                type="send",
                amount=amount,
                to_user=to_user
            )
        )
        return True

    def receive_money(self, amount: float, from_user: str) -> None:
        self._wallet.balance += amount
        self._wallet.transactions.append(
            Transaction(
                id=len(self._wallet.transactions) + 1,
                type="receive",
                amount=amount,
                from_user=from_user
            )
        ) 