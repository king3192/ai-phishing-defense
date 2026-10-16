"""
Synthetic Dataset Generator for AI Phishing Defense Platform
Generates training data for email/SMS text scanning and URL classification
covering 10 distinct scam types + legitimate/safe communications.
"""

import csv
import os
import random

SCAM_TYPES = [
    "Banking scam",
    "UPI/Payment scam",
    "OTP scam",
    "Job scam",
    "Delivery scam",
    "Investment scam",
    "Social-media account scam",
    "Fake KYC scam",
    "Prize/Lottery scam",
    "Other/Unclassified scam"
]

# Text dataset templates
TEXT_SAMPLES = [
    # Banking scam
    ("Dear customer, your SBI account 4829 has been suspended due to suspicious activity. Verify immediately at http://sbi-secure-update.net/login", "Phishing", "Banking scam"),
    ("HDFC Bank Alert: Security violation detected on your online banking profile. Reactivate now at http://hdfcnetbanking-alert.org", "Phishing", "Banking scam"),
    ("Urgent: Your ICICI netbanking login credentials will expire in 2 hours. Update password at http://icici-pass-reset.com", "Phishing", "Banking scam"),
    ("Notice: Unauthorized login attempt detected from IP 185.220.101.4. Lock your bank account now: http://bank-security-center.info", "Phishing", "Banking scam"),
    ("Wells Fargo Security Alert: Your debit card ending 9012 is blocked. Unlock instantly at http://wellsfargo-verify-card.cc", "Phishing", "Banking scam"),
    
    # UPI/Payment scam
    ("You received Rs 25,000 via PhonePe! To claim your cashback into account enter your UPI PIN here: http://phonepe-cashback-claim.xyz", "Phishing", "UPI/Payment scam"),
    ("Google Pay Reward: You won Rs 5,000 scratch card! Click link to receive money in bank account directly: http://gpay-scratch-rewards.co", "Phishing", "UPI/Payment scam"),
    ("Paytm Refund Notification: Pending refund of Rs 1,499 approved. Approve transaction by entering UPI PIN on http://paytm-refund-portal.site", "Phishing", "UPI/Payment scam"),
    ("Alert: Payment of Rs 12,000 received on Paytm. Enter UPI PIN to confirm receipt at http://paytm-transfer-verify.in", "Phishing", "UPI/Payment scam"),
    ("BHIM UPI: Double your money in 10 minutes! Send Rs 500 to get Rs 1000 cashback guaranteed. Visit http://bhim-double-cash.top", "Phishing", "UPI/Payment scam"),

    # OTP scam
    ("DO NOT SHARE: Your 6-digit OTP for fund transfer of Rs 50,000 is 894021. If you did not request this, click http://cancel-otp-trx.net", "Phishing", "OTP scam"),
    ("Security Check: Provide OTP 492018 to our customer support agent on WhatsApp to cancel unauthorized order of iPhone 15.", "Phishing", "OTP scam"),
    ("Important: Your Amazon account password reset code is 381049. Enter this code at http://amazon-auth-cancel.com to block unauthorized access.", "Phishing", "OTP scam"),
    ("Bank Alert: Verification code for Rs 75,000 loan disbursement is 991204. Share this OTP with executive calling from 9876543210.", "Phishing", "OTP scam"),
    ("WhatsApp Verification: Enter code 204918 on http://whatsapp-verification-fix.org to avoid account deletion.", "Phishing", "OTP scam"),

    # Job scam
    ("Congratulations! You are selected for Work From Home HR Data Entry Job. Salary Rs 45,000/month. Pay Rs 999 registration fee at http://wfh-careers-india.com", "Phishing", "Job scam"),
    ("Amazon India Hiring: Part-time product reviewer required. Earn Rs 3,000 daily. No experience needed. Apply at http://amazon-jobs-portal.top", "Phishing", "Job scam"),
    ("TCS Recruitment 2026: Direct interview call letter issued. Pay Rs 2,500 document processing fee to confirm slot at http://tcs-careers-verify.net", "Phishing", "Job scam"),
    ("Urgent requirement: Data Entry Typist needed. Flexible hours. Daily payout Rs 2,000. Register now: http://typist-jobs-online.site", "Phishing", "Job scam"),
    ("Google India is hiring remote workers! Earn up to $50/hour typing captchas. Limited seats left! Register: http://google-remote-hiring.xyz", "Phishing", "Job scam"),

    # Delivery scam
    ("India Post: Your package #IN892014 cannot be delivered due to incomplete home address. Update address within 24h: http://indiapost-redelivery.org", "Phishing", "Delivery scam"),
    ("FedEx Alert: Parcel arrival failed due to unpaid customs fee of Rs 149. Pay fee now to avoid return to sender: http://fedex-customs-pay.com", "Phishing", "Delivery scam"),
    ("BlueDart Express: Delivery attempt failed for shipment BD77890. Reschedule your delivery date here: http://bluedart-tracking-update.net", "Phishing", "Delivery scam"),
    ("DHL Express: Your shipment is on hold at customs. Pay $2.99 clearance charge to release package: http://dhl-clearance-portal.info", "Phishing", "Delivery scam"),
    ("Amazon Logistics: Driver could not access your building. Update entry instructions immediately: http://amazon-delivery-notes.top", "Phishing", "Delivery scam"),

    # Investment scam
    ("Crypto Alert: Guaranteed 300% profit in 7 days with AI Automated Crypto Trading Robot! Deposit 0.01 BTC now at http://crypto-profit-ai.biz", "Phishing", "Investment scam"),
    ("Stock Market Secret: Join our VIP Telegram channel for 100% accurate stock tips and daily 50% gains! Register: http://stock-market-traders.xyz", "Phishing", "Investment scam"),
    ("SEBI Approved Scheme (Fake): Invest Rs 10,000 today and receive Rs 1,000 daily forever! Zero risk. Join now: http://daily-yield-investments.co", "Phishing", "Investment scam"),
    ("Gold Trading Scam: Buy physical gold at 50% discount price before government tax increases! Order: http://discount-gold-deals.top", "Phishing", "Investment scam"),
    ("Forex Trading Bot: Automated trading platform generating $500 daily passive income. Sign up free: http://forex-passive-income.info", "Phishing", "Investment scam"),

    # Social-media account scam
    ("Instagram Copyright Notice: Your account violates copyright laws. Your account will be permanently deleted in 24 hours. Appeal at http://instagram-copyright-appeal.com", "Phishing", "Social-media account scam"),
    ("Facebook Security Team: Someone attempted to log into your FB account from Russia. Verify ownership immediately: http://facebook-security-check.net", "Phishing", "Social-media account scam"),
    ("Twitter / X Verified Badge: Get your official Blue Checkmark for free today! Claim badge: http://x-verify-badge-claim.xyz", "Phishing", "Social-media account scam"),
    ("LinkedIn Notice: 15 recruiters viewed your profile today! Upgrade to Premium Free for 1 year: http://linkedin-premium-offer.site", "Phishing", "Social-media account scam"),
    ("WhatsApp Gold: Upgrade to WhatsApp Gold Edition with video call recording and custom themes: http://whatsapp-gold-download.net", "Phishing", "Social-media account scam"),

    # Fake KYC scam
    ("Mandatory Alert: Your SIM card / Paytm KYC has expired! Complete video KYC online immediately to prevent SIM block: http://paytm-kyc-update.org", "Phishing", "Fake KYC scam"),
    ("Aadhaar Link Alert: Link your PAN card with Bank account before midnight to avoid Rs 10,000 penalty! Link now: http://pan-aadhaar-link-portal.net", "Phishing", "Fake KYC scam"),
    ("Jio Customer Alert: Your 5G SIM will be deactivated today due to non-verification of Aadhaar. Verify now: http://jio-kyc-verification.top", "Phishing", "Fake KYC scam"),
    ("Airtel Alert: Update your customer profile and KYC documents to maintain uninterrupted cellular service: http://airtel-kyc-renew.info", "Phishing", "Fake KYC scam"),
    ("Bank of Baroda KYC: Update your re-KYC form online to continue using credit card: http://bob-rekyc-online.xyz", "Phishing", "Fake KYC scam"),

    # Prize/Lottery scam
    ("KBC Lottery Winner! You have won Rs 25 Lakhs in Kaun Banega Crorepati lucky draw! Contact Manager Rana Pratap on WhatsApp or http://kbc-lottery-winner.com", "Phishing", "Prize/Lottery scam"),
    ("iPhone 15 Giveaway! You have been selected as the lucky winner of Apple Mega Prize! Pay Rs 499 shipping at http://claim-free-iphone.site", "Phishing", "Prize/Lottery scam"),
    ("Congratulations! Your mobile number won $500,000 in Toyota International Lottery. Claim prize money: http://toyota-mega-draw.top", "Phishing", "Prize/Lottery scam"),
    ("Spin & Win Reward: You won a Samsung Galaxy S24 Ultra! Fill delivery form within 10 minutes: http://spin-win-rewards.xyz", "Phishing", "Prize/Lottery scam"),
    ("Dubai Shopping Festival Prize: Congratulations, your email won 100 grams Gold Coin! Claim here: http://dubai-dsf-rewards.co", "Phishing", "Prize/Lottery scam"),

    # Other/Unclassified scam
    ("Electric Department Alert: Your electricity line will be disconnected tonight at 9:30 PM due to unpaid bill of Rs 480. Pay bill: http://power-bill-pay.net", "Phishing", "Other/Unclassified scam"),
    ("Traffic Challan Notice: Pending e-challan of Rs 1,000 registered against vehicle. View photographic evidence and pay fine: http://e-challan-parivahan-pay.site", "Phishing", "Other/Unclassified scam"),
    ("Income Tax Refund: Tax refund of Rs 15,450 approved for FY 2025-26. Submit account details to credit refund: http://incometax-refund-claim.org", "Phishing", "Other/Unclassified scam"),
    ("Gas Connection Alert: LPG subsidy of Rs 300 transferred but failed. Update bank account details: http://lpg-subsidy-update.info", "Phishing", "Other/Unclassified scam"),
    ("Unusual Activity Detected: Click here to secure your personal online portal: http://portal-security-check.xyz", "Phishing", "Other/Unclassified scam"),

    # Safe / Legitimate Communications
    ("Your HDFC Bank account xx1092 has been credited with INR 4,500 on 04-Sep-26. Info: Salary deposit.", "Safe", "None"),
    ("Your OTP for logging into Swiggy is 4920. Valid for 5 minutes. Do not share with anyone.", "Safe", "None"),
    ("Dear customer, your order #892014 has been dispatched via BlueDart. Track delivery at https://www.bluedart.com", "Safe", "None"),
    ("Meeting reminder: Project sync with design team scheduled today at 4:00 PM on Google Meet.", "Safe", "None"),
    ("Your electric bill for Aug 2026 is Rs 1,420. Due date 15-Sep. Pay online at https://www.tatapower.com", "Safe", "None"),
    ("Hi Rahul, let's catch up over coffee this weekend if you are free! Let me know what time works for you.", "Safe", "None"),
    ("Security Alert: New sign-in to your Google Account from Chrome on Windows. If this was you, no action is needed.", "Safe", "None"),
    ("Your Uber ride booking is confirmed. Driver Rajesh (MH-02-AB-1234) is reaching your location.", "Safe", "None"),
    ("Amazon: Package delivered to front door. Thank you for shopping with Amazon!", "Safe", "None"),
    ("SBI Alert: Your account statement for August 2026 is attached to this email. Password is your DOB.", "Safe", "None"),
]

# URL Dataset
URL_SAMPLES = [
    ("http://sbi-secure-update.net/login.php?user=verify", "Phishing", "Banking scam"),
    ("http://hdfcnetbanking-alert.org/auth/login", "Phishing", "Banking scam"),
    ("http://icici-pass-reset.com/verify-account", "Phishing", "Banking scam"),
    ("http://phonepe-cashback-claim.xyz/scratch?amount=25000", "Phishing", "UPI/Payment scam"),
    ("http://gpay-scratch-rewards.co/claim-now", "Phishing", "UPI/Payment scam"),
    ("http://paytm-refund-portal.site/enter-pin", "Phishing", "UPI/Payment scam"),
    ("http://cancel-otp-trx.net/verify.php", "Phishing", "OTP scam"),
    ("http://amazon-auth-cancel.com/security", "Phishing", "OTP scam"),
    ("http://wfh-careers-india.com/apply-now", "Phishing", "Job scam"),
    ("http://tcs-careers-verify.net/pay-fee", "Phishing", "Job scam"),
    ("http://indiapost-redelivery.org/address-update", "Phishing", "Delivery scam"),
    ("http://fedex-customs-pay.com/pay-149", "Phishing", "Delivery scam"),
    ("http://crypto-profit-ai.biz/invest-btc", "Phishing", "Investment scam"),
    ("http://stock-market-traders.xyz/join-vip", "Phishing", "Investment scam"),
    ("http://instagram-copyright-appeal.com/form", "Phishing", "Social-media account scam"),
    ("http://facebook-security-check.net/login", "Phishing", "Social-media account scam"),
    ("http://paytm-kyc-update.org/video-kyc", "Phishing", "Fake KYC scam"),
    ("http://pan-aadhaar-link-portal.net/link", "Phishing", "Fake KYC scam"),
    ("http://kbc-lottery-winner.com/claim-25lakhs", "Phishing", "Prize/Lottery scam"),
    ("http://claim-free-iphone.site/shipping-payment", "Phishing", "Prize/Lottery scam"),
    ("http://power-bill-pay.net/pay-electricity", "Phishing", "Other/Unclassified scam"),
    ("http://e-challan-parivahan-pay.site/fine", "Phishing", "Other/Unclassified scam"),

    ("https://www.google.com", "Safe", "None"),
    ("https://www.hdfcbank.com/personal/default", "Safe", "None"),
    ("https://www.amazon.in/gp/history", "Safe", "None"),
    ("https://www.github.com/fastapi/fastapi", "Safe", "None"),
    ("https://www.wikipedia.org", "Safe", "None"),
    ("https://www.icicibank.com/personal-banking", "Safe", "None"),
    ("https://www.sbi.co.in", "Safe", "None"),
    ("https://www.phonepe.com", "Safe", "None"),
    ("https://www.paytm.com", "Safe", "None"),
    ("https://www.airtel.in", "Safe", "None"),
    ("https://www.jio.com", "Safe", "None"),
    ("https://www.fedex.com/en-in/tracking.html", "Safe", "None"),
    ("https://www.dhl.com/in-en/home.html", "Safe", "None"),
    ("https://www.incometax.gov.in/iec/foportal/", "Safe", "None"),
    ("https://www.uidai.gov.in", "Safe", "None"),
]

def generate_csv_files(output_dir=None):
    if output_dir is None:
        output_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(output_dir, exist_ok=True)
    
    text_csv = os.path.join(output_dir, "text_dataset.csv")
    with open(text_csv, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "verdict", "scam_type"])
        for _ in range(10):
            for text, verdict, scam in TEXT_SAMPLES:
                writer.writerow([text, verdict, scam])
                
    url_csv = os.path.join(output_dir, "url_dataset.csv")
    with open(url_csv, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["url", "verdict", "scam_type"])
        for _ in range(15):
            for url, verdict, scam in URL_SAMPLES:
                writer.writerow([url, verdict, scam])
                
    print(f"Generated text dataset: {text_csv}")
    print(f"Generated URL dataset: {url_csv}")

if __name__ == "__main__":
    generate_csv_files()
