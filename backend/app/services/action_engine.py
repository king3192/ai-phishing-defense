from typing import List

def generate_action_plan(verdict: str, scam_type: str, interaction_level: str = "none") -> List[str]:
    """
    Generates step-by-step actionable response checklist
    based on verdict, scam category, and user interaction level.
    """
    if verdict == "Safe":
        return [
            "This communication appears safe. Maintain general online security practices.",
            "Verify sender identity if requesting confidential account changes."
        ]

    steps = []

    # 1. Base steps based on user interaction level
    if interaction_level == "entered_info":
        steps.extend([
            "Contact your bank or financial provider immediately to report compromised credentials.",
            "Change your online banking / platform password now on the official portal.",
            "Freeze or block your affected debit/credit card or UPI handle.",
            "Monitor your bank account transactions closely for any unauthorized debits.",
            "Enable 2-Factor Authentication (2FA) on all your sensitive online accounts."
        ])
    elif interaction_level == "clicked":
        steps.extend([
            "Close the suspicious website or pop-up window immediately.",
            "Do NOT enter any passwords, OTPs, or personal identification details.",
            "Clear your browser cache and cookies for that specific domain.",
            "Run a quick anti-malware scan on your browser/device."
        ])
    else: # "none" or default
        steps.extend([
            "Do NOT click on any links or open attachments in this message.",
            "Delete the suspicious message/email from your inbox permanently.",
            "Block the sender's email address or mobile phone number immediately."
        ])

    # 2. Scam-Type Specific Add-on Recommendations
    if scam_type in ["Banking scam", "UPI/Payment scam", "OTP scam"]:
        steps.append("Report the phishing URL/number to the National Cyber Crime Reporting Portal (cybercrime.gov.in) or your local police financial unit.")
        steps.append("Remember: No legitimate bank or payment app (PhonePe, Paytm, GPay) will EVER ask for your UPI PIN to RECEIVE money.")
    elif scam_type == "Fake KYC scam":
        steps.append("Do NOT call phone numbers printed inside SMS alerts. Verify KYC status directly inside your official bank app or Telecom carrier app.")
        steps.append("Report the fraud number to your telecom operator to block spam SMS senders.")
    elif scam_type == "Job scam":
        steps.append("Never pay any registration fee, security deposit, or laptop fee for a job offer. Genuine employers do not charge applicants.")
        steps.append("Verify the employer's official careers portal independently via LinkedIn or corporate website.")
    elif scam_type == "Investment scam":
        steps.append("Verify whether the entity is registered with financial regulators (e.g. SEBI, RBI, SEC) before making any deposits.")
        steps.append("Be extremely cautious of claims promising guaranteed daily profits or risk-free crypto/forex returns.")
    elif scam_type == "Prize/Lottery scam":
        steps.append("Ignore demands for 'processing fees' or 'customs duties' to claim prizes. Legitimate lotteries never require payment to collect winnings.")
    elif scam_type == "Delivery scam":
        steps.append("Check your tracking status directly on the official postal/courier website (e.g. India Post, FedEx, DHL), not via text links.")
    elif scam_type == "Social-media account scam":
        steps.append("Log into your social media account directly via official mobile app to check for genuine copyright or security notifications.")

    return steps
