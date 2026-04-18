from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import io

app = FastAPI(title="Pothole Detector API")

# Setup CORS to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading BLIP model... This may take a moment.")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
print("Model loaded successfully.")

@app.post("/detect")
async def detect_pothole(file: UploadFile = File(...)):
    try:
        # Load the uploaded image into memory (this replaces the Image.open("your_image.jpg") step cleanly)
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Process image for model (Exact logic from code.py)
        inputs = processor(image, return_tensors="pt")
        outputs = model.generate(**inputs, max_new_tokens=50)
        caption = processor.decode(outputs[0], skip_special_tokens=True).lower()
        
        # If the generated caption has hole or any word related to pothole, flag it
        pothole_words = ["pothole", "hole", "crater", "damage", "crack", "broken", "rough"]
        
        if any(word in caption for word in pothole_words):
            result = "Pothole detected"
        else:
            result = "Pothole not detected"

        return {
            "caption": caption,
            "result": result
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
