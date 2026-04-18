from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

# Step 1: Load model and processor
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# Step 2: Load your image
try:
    image = Image.open(r"C:\Users\Hp\Downloads").convert("RGB")
except FileNotFoundError:
    print("Error: Could not find pothole.jpg in Downloads. Using default image.")
    image = Image.open("your_image.jpg").convert("RGB")

# Step 3: Process image for model
inputs = processor(image, return_tensors="pt")

# Step 4: Generate caption
outputs = model.generate(**inputs)

# Step 5: Decode output
caption = processor.decode(outputs[0], skip_special_tokens=True)

# Step 6: Print result
print("Generated Caption:", caption)

if "pothole" in caption:
    print("Pothole detected")
elif "hole" in caption and "road" in caption:
    print("Pothole detected")
elif "puddle" in caption and "road" in caption:
    print("Pothole detected")
else:
    print("Pothole not detected")
