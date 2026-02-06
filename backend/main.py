from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import SQLModel, Session, create_engine, select
from datetime import date as dt
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from models import Customer, ATM, Transaction, CustomerStatus, ATM_Details

# Database Setup
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for Requests
class LoginRequest(BaseModel):
    card_name: str
    pin: str
    atm_location: str # When logging in as ATM (e.g. INDIRA), this might be ignored or used for cross-check

class WithdrawalRequest(BaseModel):
    customer_id: int
    atm_id: int
    amount: int

class ResetPinRequest(BaseModel):
    customer_id: int
    new_pin: str

# Use a generic request for ATM PIN reset if needed, but reusing ResetPin logic usually targets Customers.
# If ATM wants to reset its own PIN, we need a separate endpoint or logic.
# For now, assuming "Reset Pin" on dashboard is for Customer, but if ATM is logged in, maybe they reset THEIR pin?
# Let's add a specific ATM PIN reset request just in case.
class ATMResetPinRequest(BaseModel):
    atm_id: int
    new_pin: str

# Startup Event for Seeding
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    with Session(engine) as session:
        # Check if initialized
        if not session.exec(select(ATM)).first():
            # Seed ATMs with Credentials
            indiranagar = ATM(location="Indiranagar", card_name="INDIRA", pin="0000", current_cash=5000)
            malnad = ATM(location="Malnad", card_name="MALNAD", pin="0000", current_cash=5000)
            session.add(indiranagar)
            session.add(malnad)
            
            # Seed Customers with PINs
            customers = [
                Customer(name="Tom", card_name="tom", balance=20, pin="1234"),
                Customer(name="Jerry", card_name="jerry", balance=16, pin="1234"),
                Customer(name="Chhota Bheem", card_name="bheem", balance=22, pin="1234"),
                Customer(name="Kirmada", card_name="kirmada", balance=0, status=CustomerStatus.DISABLED, pin="1234"),
                Customer(name="Little Singham", card_name="little", balance=0, status=CustomerStatus.CREDIT_ONLY, pin="1234"),
            ]
            for c in customers:
                session.add(c)
            
            session.commit()

@app.get("/")
def read_root():
    return {"message": "Creo Kids Bank Backend is running"}

@app.get("/customers")
def get_customers(session: Session = Depends(get_session)):
    return session.exec(select(Customer)).all()

@app.get("/atms")
def get_atms(session: Session = Depends(get_session)):
    return session.exec(select(ATM)).all()

@app.post("/login")
def login(request: LoginRequest, session: Session = Depends(get_session)):
    # 1. Verify ATM Location (Device check) - Common for all
    current_atm_device = session.exec(select(ATM).where(ATM.location == request.atm_location)).first()
    if not current_atm_device:
        raise HTTPException(status_code=404, detail="ATM Location not valid")

    # 2. Check if logging in as an ATM Admin User (INDIRA/MALNAD)
    # They can log in from ANY machine effectively, or we restrict INDIRA to Indiranagar?
    # User said: "create 2 users(ATMs), when they logged in..."
    # If I am INDIRA, I expect to be treated as ATM user.
    
    target_atm_user = session.exec(select(ATM).where(ATM.card_name == request.card_name)).first()
    
    if target_atm_user:
        # Verify PIN
        if target_atm_user.pin != request.pin:
             raise HTTPException(status_code=401, detail="Invalid ATM PIN")
        
        return {
            "status": "success",
            "user_type": "atm",
            "atm_id": target_atm_user.id,
            "atm_data": target_atm_user,
            "message": f"Welcome ATM Admin {target_atm_user.location}"
        }

    # 3. If not ATM, Verify Customer
    customer = session.exec(select(Customer).where(Customer.card_name == request.card_name)).first()
    if not customer:
        raise HTTPException(status_code=404, detail="User not found")

    # 4. Verify PIN
    if customer.pin != request.pin:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    # 5. Return success and IDs
    return {
        "status": "success",
        "user_type": "customer",
        "customer_id": customer.id,
        "atm_id": current_atm_device.id, # The physical ATM they are standing at
        "customer": customer,
        "atm": current_atm_device,
        "message": "Login Successful"
    }

@app.post("/withdraw")
def withdraw(request: WithdrawalRequest, session: Session = Depends(get_session)):
    # 1. Fetch Customer
    customer = session.get(Customer, request.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Check Status
    if customer.status == CustomerStatus.DISABLED:
        raise HTTPException(status_code=403, detail="Access Denied")
    # CREDIT_ONLY users are allowed to withdraw (special case - no balance check)

    # 3. Check Withdrawal Limits (Skip all limits for CREDIT_ONLY users - they have unlimited access)
    today = dt.today()
    if customer.status != CustomerStatus.CREDIT_ONLY:
        # Per Transaction Limit
        if request.amount > 10:
            raise HTTPException(status_code=400, detail="Max 10 CKB per transaction")

        # 4. Check Daily Limits
        # Today is already defined above
        todays_transactions = session.exec(
            select(Transaction)
            .where(Transaction.customer_id == customer.id)
            .where(Transaction.date == today)
        ).all()

        total_withdrawn_today = sum(t.amount for t in todays_transactions)
        transaction_count_today = len(todays_transactions)

        if total_withdrawn_today + request.amount > 25:
            raise HTTPException(status_code=400, detail="Max 25 CKB per day")
        
        if transaction_count_today >= 3:
            raise HTTPException(status_code=400, detail="Max 3 transactions per day")

    # 5. Fetch ATM
    atm = session.get(ATM, request.atm_id)
    if not atm:
        raise HTTPException(status_code=404, detail="ATM not found")

    # 6. Check Balances (Skip for CREDIT_ONLY users - they have unlimited credit)
    if customer.status != CustomerStatus.CREDIT_ONLY:
        if customer.balance < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient funds")

    if atm.current_cash < request.amount:
        raise HTTPException(status_code=400, detail="ATM Out of Cash")

    # 7. Execute Withdrawal
    customer.balance -= request.amount
    atm.current_cash -= request.amount
    
    # Create Basic Transaction Record
    transaction = Transaction(
        customer_id=customer.id,
        atm_id=atm.id,
        amount=request.amount,
        date=today
    )
    
    # Create Detailed Log Record (ATM_Details)
    detail_log = ATM_Details(
        atm_id=atm.id,
        atm_location=atm.location,
        customer_id=customer.id,
        amount_withdrawn=request.amount,
        customer_total_balance=customer.balance,
        atm_current_cash=atm.current_cash,
        date=today
    )

    session.add(transaction)
    session.add(detail_log)
    session.add(customer)
    session.add(atm) 

    # 8. Refill Logic
    if atm.location == "Indiranagar" and atm.current_cash < 25:
        atm.current_cash += 75
    elif atm.location == "Malnad" and atm.current_cash < 10:
        atm.current_cash += 40
    
    session.add(atm) 
    session.commit()
    session.refresh(customer)
    session.refresh(atm)

    return {
        "status": "success", 
        "new_balance": customer.balance, 
        "atm_balance": atm.current_cash, 
        "message": "Withdrawal successful"
    }

@app.post("/reset-pin")
def reset_pin(request: ResetPinRequest, session: Session = Depends(get_session)):
    customer = session.get(Customer, request.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate new PIN is 4 digits
    if not request.new_pin or len(request.new_pin) != 4 or not request.new_pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be exactly 4 digits")
    
    # Update PIN
    customer.pin = request.new_pin
    session.add(customer)
    
    # Decrement daily transaction count (delete last transaction for today)
    today = dt.today()
    last_transaction = session.exec(
        select(Transaction)
        .where(Transaction.customer_id == customer.id)
        .where(Transaction.date == today)
        .order_by(Transaction.timestamp.desc())
    ).first()
    
    if last_transaction:
        session.delete(last_transaction)
    
    session.commit()
    session.refresh(customer)
    
    return {"status": "success", "message": "PIN reset successfully and daily transaction count decremented"}

@app.post("/atm/reset-pin")
def atm_reset_pin(request: ATMResetPinRequest, session: Session = Depends(get_session)):
    atm = session.get(ATM, request.atm_id)
    if not atm:
        raise HTTPException(status_code=404, detail="ATM not found")
        
    if not request.new_pin or len(request.new_pin) != 4 or not request.new_pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be exactly 4 digits")
        
    atm.pin = request.new_pin
    session.add(atm)
    session.commit()
    return {"status": "success", "message": "ATM PIN Updated"}

@app.get("/atm/logs/{atm_id}")
def get_atm_logs(atm_id: int, session: Session = Depends(get_session)):
    logs = session.exec(
        select(ATM_Details)
        .where(ATM_Details.atm_id == atm_id)
        .order_by(ATM_Details.timestamp.desc())
    ).all()
    return logs
