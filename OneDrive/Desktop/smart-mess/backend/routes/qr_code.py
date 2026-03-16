# ============================================================
#  routes/qr_code.py  — Generate & stream QR code as PNG
# ============================================================

import io
import qrcode
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter()

FRONTEND_URL = "http://localhost:5173"


@router.get("/{mess_name}")
async def get_qr_code(mess_name: str):
    """
    Generates a QR code for the given mess name and returns it as a PNG image.
    The QR encodes: http://localhost:5173/?mess=MessName
    """
    # Build the URL the student will land on after scanning
    feedback_url = f"{FRONTEND_URL}/?mess={mess_name}"

    # Generate QR code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(feedback_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Write image to memory buffer (no need to save to disk)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    # Stream PNG back to frontend
    return StreamingResponse(
        buffer,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{mess_name}_qr.png"'},
    )
