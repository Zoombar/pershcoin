from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    user_id = Column(BigInteger, primary_key=True)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    coins = Column(Integer, default=0)
    total_taps = Column(Integer, default=0)
    referral_code = Column(String(20), unique=True, nullable=False)
    referred_by = Column(BigInteger, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_tap_at = Column(DateTime, nullable=True)
    tap_history = Column(Text, nullable=True)  # JSON для rate limiting

    # Relationships
    referrals = relationship("Referral", foreign_keys="Referral.referrer_id", back_populates="referrer")
    referrer_user = relationship("User", remote_side=[user_id], foreign_keys=[referred_by])


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    referrer_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    referred_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    coins_earned = Column(Integer, default=0)
    bonus_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id], back_populates="referrals")
    referred = relationship("User", foreign_keys=[referred_id])
