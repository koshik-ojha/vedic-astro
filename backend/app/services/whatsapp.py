import os
from twilio.rest import Client
from app.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER, RECIPIENT_WHATSAPP_NUMBER


async def send_whatsapp_message(message: str) -> dict:
    """
    Send WhatsApp message using Twilio SDK
    
    Args:
        message: The message content to send
        
    Returns:
        dict: Result with success status and message
    """
    try:
        # Check if Twilio credentials are configured
        if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER, RECIPIENT_WHATSAPP_NUMBER]):
            print("Warning: Twilio WhatsApp credentials not configured. Message not sent.")
            print(f"Message content:\n{message}")
            print("-" * 50)
            # Return success for development/testing without actual sending
            return {"success": True, "message": "Message logged (Twilio not configured)"}
        
        # Initialize Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Send WhatsApp message
        twilio_message = client.messages.create(
            from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
            body=message,
            to=f"whatsapp:{RECIPIENT_WHATSAPP_NUMBER}"
        )
        
        print(f"WhatsApp message sent successfully! SID: {twilio_message.sid}")
        
        return {
            "success": True,
            "message": "WhatsApp message sent successfully",
            "sid": twilio_message.sid,
            "status": twilio_message.status
        }
                
    except Exception as e:
        print(f"Error sending WhatsApp message: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

