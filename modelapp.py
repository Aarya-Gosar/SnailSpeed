import streamlit as st
import pandas as pd
import json
import requests
import base64


# --- Constants ---
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "openchat"

# --- Functions ---
def query_ollama(prompt):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }
    )
    return response.json()["response"].strip()

def load_profile_from_csv(user_csv="setup_data.csv", image_csv="memories.csv"):
    user_df = pd.read_csv(user_csv).iloc[0]
    image_df = pd.read_csv(image_csv).iloc[0]

    profile = {}

    # Add user profile information
    for key in user_df.index:
        val = str(user_df[key]).strip()
        if val:
            profile[key] = val

    # Add image-based memory details
    profile["Image Memory"] = {
        "Image Path": str(image_df.get("image file path", "")),
        "Caption": str(image_df.get("caption", "")),
        "Scene": str(image_df.get("scene", "")),
        "People Count": int(image_df.get("people_count", 0)),
        "Objects": str(image_df.get("objects", "")),
        "Detected Text": str(image_df.get("text", ""))
    }

    return profile


def generate_daily_routine(profile):
    prompt = f"""
You are a friendly assistant for someone with Alzheimer's.

The person greeted you to start the day. Based on their personal info, greet them warmly and describe their usual daily routine in simple, comforting words.

Profile:
{json.dumps(profile, indent=2)}
"""
    return query_ollama(prompt)

def generate_memory_hint(profile):
    prompt = f"""
You're a memory assistant. Give the person a gentle hint to help them recall a specific memory from their life (based on the profile below). 

Don't reveal the memory directly — just provide a soft clue to trigger their memory.

Profile:
{json.dumps(profile, indent=2)}
"""
    return query_ollama(prompt)

def reveal_memory(profile, user_attempt):
    prompt = f"""
The person tried to recall a memory after your hint. Their attempt was:

"{user_attempt}"

Now, kindly provide the actual memory with a warm and detailed description. Be gentle and kind if they didn’t remember it fully.

Based on this personal information:
{json.dumps(profile, indent=2)}
"""
    return query_ollama(prompt)

# --- Streamlit Setup ---
# st.set_page_config(page_title="Memory Companion", layout="centered")
#st.title("🌞 Memora Your companion")


# Set page configuration

st.set_page_config(page_title="Memory Recall Assistant", layout="centered")
st.markdown('<div class="main-container">', unsafe_allow_html=True)

st.markdown('<h1 class="custom-title">Memora – Your Companion</h1>', unsafe_allow_html=True)

# === Function to Set Background Image ===
def set_background(image_file):
    with open(image_file, "rb") as image:
        encoded = base64.b64encode(image.read()).decode()

    st.markdown(f"""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap');

        .stApp {{
            background-image: url("data:image/png;base64,{encoded}");
            background-size: cover;
            background-attachment: fixed;
            background-repeat: no-repeat;
            color: #000000 !important;
        }}
        .main-container {{
            background-color: rgba(255, 255, 255, 0.85);
            padding: 2rem;
            border-radius: 1rem;
            max-width: 800px;
            margin: auto;
            color: #000000 !important;
        }}
        h1.custom-title {{
            font-family: 'Playfair Display', serif;
            font-size: 3rem;
            font-weight: 600;
            text-align: center;
            color: #000000;
            margin-bottom: 1.5rem;
        }}
        .stTextInput > div > div > input,
        .stTextArea > div > textarea {{
            background-color: #ffffffcc;
            color: #000000 !important;
        }}
        .stButton button {{
            background-color: #4CAF50;
            color: white;
            border-radius: 0.5rem;
        }}
        .stMarkdown h1, .stMarkdown h2, .stMarkdown h3, .stMarkdown h4, .stMarkdown h5, .stMarkdown h6,
        .stMarkdown p, .stMarkdown span, .stMarkdown div, .css-1v0mbdj, .css-10trblm,
        .st-expanderContent, .stJson {{
            color: #000000 !important;
        }}
        .stAlert, .stAlert > div {{
            background-color: #ffffffaa;
            color: #000000 !important;
        }}
        </style>
    """, unsafe_allow_html=True)

# 🔁 Call the function with your image file
set_background("bg1.png")

# 🌸 Wrap main content in container for styling


st.markdown('</div>', unsafe_allow_html=True)


# --- Session State ---
if "user_profile" not in st.session_state:
    st.session_state.user_profile = load_profile_from_csv()

if "step" not in st.session_state:
    st.session_state.step = 0

# --- Step 0: User Greeting ---
if st.session_state.step == 0:
    st.subheader("👋 Start Your Day")
    greeting = st.text_input("Say hello to your assistant:", key="greet_input")
    if st.button("Start Day"):
        if greeting.strip():
            st.session_state.greeting = greeting
            st.session_state.routine = generate_daily_routine(st.session_state.user_profile)
            st.session_state.step = 1
            st.rerun()

# --- Step 1: Show Daily Routine ---
elif st.session_state.step == 1:
    st.success("👋 " + st.session_state.greeting)
    st.markdown("### 🗓️ Here's your usual routine:")
    st.write(st.session_state.routine)
    if st.button("Try to recall a memory"):
        st.session_state.memory_hint = generate_memory_hint(st.session_state.user_profile)
        st.session_state.step = 2
        st.rerun()

# --- Step 2: Give Memory Hint ---
elif st.session_state.step == 2:
    st.markdown("### 🧠 Let's Remember Something")
    st.info(f"🧩 Hint: {st.session_state.memory_hint}")
    user_guess = st.text_input("What do you think this memory is about?", key="memory_input")
    if st.button("Reveal the memory"):
        st.session_state.memory_attempt = user_guess
        st.session_state.memory_reveal = reveal_memory(
            st.session_state.user_profile,
            user_guess
        )
        st.session_state.step = 3
        st.rerun()

# --- Step 3: Reveal Actual Memory ---
elif st.session_state.step == 3:
    st.markdown("### 📖 Here's what really happened:")
    st.success(st.session_state.memory_reveal)
    if st.button("Try Another Memory"):
        st.session_state.step = 2
        st.rerun()

# --- Show Profile ---
with st.expander("🧾 Personal Info"):
    st.json(st.session_state.user_profile)
