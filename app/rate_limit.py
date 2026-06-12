"""
Rate limiting — brute-force hujumlariga qarshi.
IP manzil bo'yicha so'rovlar sonini cheklaydi (ayniqsa login uchun).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
