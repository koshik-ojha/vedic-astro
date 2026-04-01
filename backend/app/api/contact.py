from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.services.whatsapp import send_whatsapp_message

router = APIRouter()


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    service: str = ""
    message: str


@router.post("/submit")
async def submit_contact_form(contact: ContactRequest):
    """
    Receive contact form submission and send WhatsApp notification
    """
    try:
        # Format the message for WhatsApp
        whatsapp_message = f"""
🌟 *New Contact Form Submission*

👤 *Name:* {contact.name}
📧 *Email:* {contact.email}
📱 *Phone:* {contact.phone or "Not provided"}
🎯 *Service:* {contact.service or "Not specified"}

💬 *Message:*
{contact.message}
        """.strip()
        
        # Send WhatsApp message
        result = await send_whatsapp_message(whatsapp_message)
        
        if result.get("success"):
            return {
                "success": True,
                "message": "Your message has been sent successfully!"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to send message. Please try again or contact us directly."
            )
            
    except Exception as e:
        print(f"Error in contact form submission: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request."
        )
