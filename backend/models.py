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
    card_name: str = Field(unique=True, index=True) # e.g. INDIRA, MALNAD
    pin: str = Field(default="0000")
    current_cash: int

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id")
    atm_id: int = Field(foreign_key="atm.id")
    amount: int
    timestamp: datetime = Field(default_factory=datetime.now)
    date: dt = Field(default_factory=dt.today)

class ATM_Details(SQLModel, table=True):
    """
    Log usage details as requested:
    id(ATM)|location|id(CustomerID)|amount(withdrawn)|total_balance|date|current cash
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    atm_id: int = Field(foreign_key="atm.id")
    atm_location: str # Storing redundant string as per request "location" in table
    customer_id: int = Field(foreign_key="customer.id")
    amount_withdrawn: int
    customer_total_balance: int # Snapshot of customer balance after tx
    atm_current_cash: int # Snapshot of ATM cash after tx
    date: dt = Field(default_factory=dt.today)
    timestamp: datetime = Field(default_factory=datetime.now)
