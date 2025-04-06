from transformers import BlipProcessor, BlipForConditionalGeneration
from torchvision import models, transforms
from PIL import Image
import torch
import urllib
import cv2
import easyocr
from ultralytics import YOLO
import openai
import os
# import wandb
# import wandb.compat.collections
import sys

# Device config
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# BLIP for image captioning
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

def get_image_caption(image_path):
    image = Image.open(image_path).convert('RGB')
    inputs = processor(image, return_tensors="pt").to(device)
    out = caption_model.generate(**inputs)
    return processor.decode(out[0], skip_special_tokens=True)

# YOLOv8 for object detection
object_model = YOLO("yolov8x.pt")

def get_objects(image_path):
    results = object_model(image_path)
    labels = results[0].names
    detections = results[0].boxes.cls.tolist()
    objects = list({labels[int(i)] for i in detections})
    return objects

# Places365 for scene recognition
scene_model = models.resnet18(num_classes=365)
checkpoint = torch.hub.load_state_dict_from_url(
    'http://places2.csail.mit.edu/models_places365/resnet18_places365.pth.tar',
    map_location=device
)
# Fix key mismatch (remove "module.")
fixed_state_dict = {k.replace("module.", ""): v for k, v in checkpoint['state_dict'].items()}
scene_model.load_state_dict(fixed_state_dict)
scene_model.eval().to(device)

scene_labels_bytes = urllib.request.urlopen("https://raw.githubusercontent.com/csailvision/places365/master/categories_places365.txt").readlines()
scene_labels = [line.decode('utf-8').strip().split(' ')[0][3:] for line in scene_labels_bytes]

def predict_scene(image_path):
    image = Image.open(image_path).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    img_tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        logit = scene_model(img_tensor)
    probs = torch.nn.functional.softmax(logit, dim=1)
    top5 = torch.topk(probs, 5)
    return [scene_labels[i] for i in top5.indices[0]]

# Face detection with OpenCV
def detect_faces(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    return len(faces)

# OCR with EasyOCR
reader = easyocr.Reader(['en'])

def extract_text(image_path):
    result = reader.readtext(image_path)
    return [text for _, text, _ in result]

# OpenAI-based memory generation using oLLaMA (local API)
def generate_memory_text(caption, scene, people_count, objects, texts):
    prompt = f"""
    Given the following information extracted from a photo, write a short memory-style description as if remembering the moment:

    - Caption: {caption}
    - Scene: {scene}
    - People in photo: {people_count}
    - Objects: {', '.join(objects)}
    - Text found in the image: {', '.join(texts) if texts else 'None'}

    Respond with a warm, human tone that helps someone remember the moment in a sentimental way.
    """

    response = openai.ChatCompletion.create(
        model="llama2",
        messages=[
            {"role": "system", "content": "You are a kind and thoughtful memory companion."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message['content'].strip()

def create_memory_from_image(image_path):
    caption = get_image_caption(image_path)
    objects = get_objects(image_path)
    faces = detect_faces(image_path)
    scene = predict_scene(image_path)
    texts = extract_text(image_path)

    memory_text = generate_memory_text(
        caption=caption,
        scene=scene[0] if scene else "Unknown",
        people_count=faces,
        objects=objects,
        texts=texts
    )
    return memory_text

def save_to_csv(image_path, caption, scene, people_count, objects, texts, csv_file="memories.csv"):
    row = {
        "image_path": image_path,
        "caption": caption,
        "scene": scene,
        "people_count": people_count,
        "objects": ", ".join(objects),
        "text": ", ".join(texts)
    }

    df = pd.DataFrame([row])
    if not os.path.exists(csv_file):
        df.to_csv(csv_file, index=False)
    else:
        df.to_csv(csv_file, mode='a', header=False, index=False)

def create_memory_from_image(image_path):
    caption = get_image_caption(image_path)
    objects = get_objects(image_path)
    faces = detect_faces(image_path)
    scene = predict_scene(image_path)
    texts = extract_text(image_path)

    save_to_csv(
        image_path=image_path,
        caption=caption,
        scene=scene[0] if scene else "Unknown",
        people_count=faces,
        objects=objects,
        texts=texts
    )
if __name__ == "__main__":
    image_path = "/home/nidhi/Downloads/test_img.jpeg"
    create_memory_from_image(image_path)
    print(f"✅ Data from {image_path} saved to CSV.")
    os.environ["OPENAI_API_BASE"] = "http://localhost:11434/v1"  # for oLLaMA running locally
    openai.api_base = os.environ["OPENAI_API_BASE"]
    openai.api_key = "ollama"  # static value used by oLLaMA
    image_path = "your_image.jpg"
    memory = create_memory_from_image(image_path)
    print("\n🧠 Memory:\n", memory)
