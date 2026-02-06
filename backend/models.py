from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date as dt
from enum import Enum

class CustomerStatus(str, Enum):
    ACTIVE = "Active"
    DISABLED = "Disabled"
    CREDIT_ONLY = "CreditOnly"

class Customer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    card_name: str = Field(unique=True, index=True)
    pin: str = Field(default="1234")
    balance: int
    status: CustomerStatus = Field(default=CustomerStatus.ACTIVE)

class ATM(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    location: str = Field(unique=True)
    current_cash: int

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id")
    atm_id: int = Field(foreign_key="atm.id")
    amount: int
    timestamp: datetime = Field(default_factory=datetime.now)
    date: dt = Field(default_factory=dt.today)
