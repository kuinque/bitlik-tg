from typing import List, Dict, Any
from ..models.wallet import Wallet, Transaction
from config.config import MOCK_USER_DATA

class WalletService:
    def __init__(self):
        # Store initial mock data and per-user wallets state
        self._initial_data = MOCK_USER_DATA
        self._wallets: Dict[str, Wallet] = {}

    def _get_wallet(self, user_id: str) -> Wallet:
        # Lazily initialize a wallet for each user
        if user_id not in self._wallets:
            self._wallets[user_id] = Wallet.from_dict(self._initial_data)
        return self._wallets[user_id]

    def get_balance(self, user_id: str) -> Dict[str, Any]:
        wallet = self._get_wallet(user_id)
        return {
            "balance": wallet.balance,
            "currency": wallet.currency
        }

    def get_transactions(self, user_id: str) -> List[Dict[str, Any]]:
        wallet = self._get_wallet(user_id)
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
            for t in wallet.transactions
        ]

    def send_money(self, user_id: str, amount: float, to_user: str) -> bool:
        wallet = self._get_wallet(user_id)
        if amount > wallet.balance:
            return False
        wallet.balance -= amount
        wallet.transactions.append(
            Transaction(
                id=len(wallet.transactions) + 1,
                type="send",
                amount=amount,
                to_user=to_user
            )
        )
        return True

    def receive_money(self, user_id: str, amount: float, from_user: str) -> None:
        wallet = self._get_wallet(user_id)
        wallet.balance += amount
        wallet.transactions.append(
            Transaction(
                id=len(wallet.transactions) + 1,
                type="receive",
                amount=amount,
                from_user=from_user
            )
        )