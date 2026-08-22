import os
import sys
import json
import re
import difflib
import asyncio
import edge_tts
from flask import Flask, request, jsonify, send_from_directory, make_response
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')

# ==========================================================================
# Campus Database
# ==========================================================================
MAIN_GATE = [16.708013698320368, 74.47822739425105]

campus_data = {
    "departments": {
        "CSE": {
            "name": "Computer Science & Engineering",
            "coords": {
                "38": [16.70790, 74.47940],
                "43": [16.70791, 74.47941],
                "44": [16.70792, 74.47942],
                "45": [16.70793, 74.47943],
                "60": [16.70794, 74.47944]
            }
        },
        "MECH": {
            "name": "Mechanical Engineering",
            "coords": {
                "21": [16.70770, 74.47920],
                "22": [16.70771, 74.47921],
                "23": [16.70772, 74.47922]
            }
        },
        "Civil": {
            "name": "Civil Engineering",
            "coords": {
                "41": [16.70750, 74.47900],
                "42": [16.70751, 74.47901]
            }
        },
        "Electrical": {
            "name": "Electrical Engineering",
            "coords": {
                "61": [16.70730, 74.47880],
                "62": [16.70731, 74.47881]
            }
        },
        "ECE": {
            "name": "Electronics & Computer Engineering",
            "coords": {
                "81": [16.70710, 74.47860],
                "82": [16.70711, 74.47861]
            }
        },
        "AR": {
            "name": "Architecture Department",
            "coords": {
                "101": [16.70690, 74.47840],
                "102": [16.70691, 74.47841]
            }
        },
        "AIDS": {
            "name": "AI & Data Science",
            "coords": {
                "111": [16.70700, 74.47850],
                "112": [16.70701, 74.47851]
            }
        },
        "Library": {
            "name": "Central Library",
            "coords": {
                "121": [16.70670, 74.47820]
            }
        },
        "Admin": {
            "name": "Admin & Executive Offices",
            "coords": {
                "Principal's Cabin": [16.70805, 74.47955],
                "ED Sir's Cabin": [16.70806, 74.47956],
                "Board Room": [16.70807, 74.47957],
                "Main Office": [16.70808, 74.47958],
                "Exam Cell": [16.70810, 74.47960],
                "Placement Cell": [16.70811, 74.47961]
            }
        }
    },
    "labs": {
        "CSE": {
            "59": {"name": "Project Lab", "coord": [16.70795, 74.47945]},
            "58": {"name": "Programming Lab", "coord": [16.70796, 74.47946]},
            "56": {"name": "Network Lab", "coord": [16.70797, 74.47947]},
            "55": {"name": "Web Lab", "coord": [16.70798, 74.47948]},
            "54": {"name": "OS Lab", "coord": [16.70799, 74.47949]},
            "53": {"name": "HOD Office", "coord": [16.70800, 74.47950]},
            "52": {"name": "Language Lab", "coord": [16.70802, 74.47952]},
            "51": {"name": "DB Lab", "coord": [16.70803, 74.47953]}
        },
        "MECH": {
            "201": {"name": "Thermal Lab", "coord": [16.70780, 74.47930]},
            "202": {"name": "Workshop", "coord": [16.70781, 74.47931]}
        },
        "Civil": {
            "301": {"name": "Survey Lab", "coord": [16.70755, 74.47905]}
        },
        "Electrical": {
            "401": {"name": "Machine Lab", "coord": [16.70735, 74.47885]}
        },
        "ECE": {
            "501": {"name": "VLSI Lab", "coord": [16.70715, 74.47865]}
        },
        "AR": {
            "601": {"name": "Robotics Lab", "coord": [16.70695, 74.47845]}
        },
        "AIDS": {
            "701": {"name": "AI Lab", "coord": [16.70702, 74.47852]}
        },
        "Admin": {
            "Board Room": {"name": "Board Room", "coord": [16.70807, 74.47957]},
            "Exam Cell": {"name": "Exam Cell Office", "coord": [16.70810, 74.47960]},
            "Placement Cell": {"name": "Placement Cell Office", "coord": [16.70811, 74.47961]}
        }
    },
    "faculty": {
        "CSE": [
            {
                "name": "Dr. A. B. Patil",
                "designation": "Professor & HOD",
                "cabin": "HOD Office (Room 53)",
                "subject": "Computer Networks & Wireless Communication",
                "coord": [16.70800, 74.47950]
            },
            {
                "name": "Prof. P. Q. Deshmukh",
                "designation": "Assistant Professor",
                "cabin": "OS Lab (Room 54)",
                "subject": "Operating Systems",
                "coord": [16.70799, 74.47949]
            },
            {
                "name": "Prof. S. R. Mane",
                "designation": "Assistant Professor",
                "cabin": "Programming Lab (Room 58)",
                "subject": "Java Programming",
                "coord": [16.70796, 74.47946]
            }
        ],
        "MECH": [
            {
                "name": "Dr. S. K. Jadhav",
                "designation": "Professor & HOD",
                "cabin": "Thermal Lab (Room 201)",
                "subject": "Thermodynamics",
                "coord": [16.70780, 74.47930]
            },
            {
                "name": "Prof. A. L. Shinde",
                "designation": "Assistant Professor",
                "cabin": "Workshop Room (Room 202)",
                "subject": "Manufacturing Engineering",
                "coord": [16.70781, 74.47931]
            }
        ],
        "Civil": [
            {
                "name": "Dr. R. V. Kulkarni",
                "designation": "Professor & HOD",
                "cabin": "Survey Office (Room 301)",
                "subject": "Surveying & Building Planning",
                "coord": [16.70755, 74.47905]
            }
        ],
        "Electrical": [
            {
                "name": "Dr. K. N. Joshi",
                "designation": "Professor & HOD",
                "cabin": "Machine Cabin (Room 401)",
                "subject": "Electrical Machines",
                "coord": [16.70735, 74.47885]
            }
        ],
        "ECE": [
            {
                "name": "Dr. M. M. Kamble",
                "designation": "Professor & HOD",
                "cabin": "VLSI Cabin (Room 501)",
                "subject": "VLSI Systems & Microprocessors",
                "coord": [16.70715, 74.47865]
            }
        ],
        "AR": [
            {
                "name": "Dr. G. B. Chavan",
                "designation": "Professor & HOD",
                "cabin": "Robotics Design (Room 601)",
                "subject": "Automation Systems",
                "coord": [16.70695, 74.47845]
            }
        ],
        "AIDS": [
            {
                "name": "Dr. S. S. Kamble",
                "designation": "Professor & HOD",
                "cabin": "AI Room (Room 701)",
                "subject": "Artificial Intelligence & Data Science",
                "coord": [16.70702, 74.47852]
            }
        ],
        "Library": [
            {
                "name": "Mr. P. B. More",
                "designation": "Librarian",
                "cabin": "Library Cabin (Room 121)",
                "subject": "Information Management",
                "coord": [16.70670, 74.47820]
            }
        ],
        "Admin": [
            {
                "name": "Dr. Sanjay A. Khot",
                "designation": "Principal",
                "cabin": "Principal's Cabin",
                "subject": "Administration & Leadership",
                "coord": [16.70805, 74.47955]
            },
            {
                "name": "Hon. Anil A. Bagane",
                "designation": "Executive Director (ED Sir)",
                "cabin": "ED Sir's Cabin",
                "subject": "Strategic Management",
                "coord": [16.70806, 74.47956]
            },
            {
                "name": "Mr. S. M. Dhabade",
                "designation": "Registrar / Administrative Officer",
                "cabin": "Main Office",
                "subject": "Campus Records & Finance",
                "coord": [16.70808, 74.47958]
            }
        ]
    },
    "emergency": {
        "hospital": {
            "name": "Sharad Ayurved Hospital (Yadrav)",
            "phone": "02322-253000",
            "coord": [16.70582, 74.47563],
            "description": "Right next to the SITCOE campus."
        },
        "police": {
            "name": "Shivaji Nagar Police Station",
            "phone": "0230-2432000",
            "coord": [16.68551, 74.45861],
            "description": "Police station serving the Yadrav/Ichalkaranji sector."
        }
    }
}

# Setup Gemini AI Model if API key is provided
api_key = os.environ.get("GEMINI_API_KEY")
model = None

if api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # Using a reliable generative model
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("Gemini AI API successfully configured.")
    except Exception as e:
        print(f"Error loading Gemini AI model: {e}. Falling back to rule-based NLP.")
        model = None
else:
    print("GEMINI_API_KEY environment variable not found. Operating in Local Rule-Based NLP Mode.")

# Helper to flatten targets for NLP matching and search
def get_flat_targets():
    targets = []
    
    # 1. Departments
    for dept_code, dept_info in campus_data["departments"].items():
        keywords = [dept_code.lower(), dept_info["name"].lower(), f"{dept_code.lower()} department"]
        if dept_code.lower() == "library":
            keywords.extend(["लायब्ररी", "ग्रंथालय", "पुस्तकालय", "वाचनालय"])
        elif dept_code.lower() == "admin":
            keywords.extend(["प्रशासन", "प्रशासकीय"])
        
        targets.append({
            "name": dept_info["name"],
            "keywords": keywords,
            "type": "Department",
            "dept": dept_code,
            "coord": list(dept_info["coords"].values())[0] if dept_info["coords"] else MAIN_GATE,
            "color": "#ef4444"
        })
        
        # 2. Classrooms
        for room, coord in dept_info["coords"].items():
            is_num = room.isdigit()
            label = f"{dept_code} Room {room}" if is_num else room
            keywords = [label.lower(), f"room {room}".lower(), f"room{room}".lower(), f"{dept_code.lower()} room {room}".lower(), room.lower()]
            if "principal" in room.lower():
                keywords.extend(["प्राचार्य", "प्रिन्सिपॉल", "प्राचार्य केबिन"])
            elif "ed sir" in room.lower():
                keywords.extend(["संचालक", "इडी सर"])
                
            targets.append({
                "name": label,
                "keywords": keywords,
                "type": "Classroom" if is_num else "Admin Location",
                "dept": dept_code,
                "coord": coord,
                "color": "#3b82f6" if is_num else "#ef4444"
            })
            
    # 3. Laboratories
    for dept_code, labs in campus_data["labs"].items():
        for room, lab_info in labs.items():
            keywords = [lab_info["name"].lower(), f"{lab_info['name'].lower()} lab", f"{dept_code.lower()} {lab_info['name'].lower()}", f"room {room}".lower(), f"lab {room}".lower()]
            keywords.extend(["लॅब", "प्रयोगशाळा"])
            targets.append({
                "name": f"{lab_info['name']} ({dept_code})",
                "keywords": keywords,
                "type": "Laboratory",
                "dept": dept_code,
                "coord": lab_info["coord"],
                "color": "#10b981"
            })
            
    # 4. Faculty Cabin
    for dept_code, members in campus_data["faculty"].items():
        for fac in members:
            normalized_name = fac["name"].lower().replace("dr. ", "").replace("prof. ", "")
            targets.append({
                "name": fac["name"],
                "keywords": [fac["name"].lower(), normalized_name, f"{normalized_name}'s cabin", f"{normalized_name}'s office", f"cabin of {normalized_name}", fac["cabin"].lower()],
                "type": f"Faculty ({fac['designation']})",
                "dept": dept_code,
                "coord": fac["coord"],
                "color": "#8b5cf6",
                "info": f"Designation: {fac['designation']}\nCabin: {fac['cabin']}\nSubject: {fac['subject']}"
            })
            
    # 5. Main Gate
    targets.append({
        "name": "SITCOE Main Gate",
        "keywords": ["main gate", "entrance", "gate", "sitcoe gate", "sitcoe main gate", "starting point", "मुख्य गेट", "प्रवेशद्वार", "गेट", "मुख्य दरवाजा"],
        "type": "Campus Entrance",
        "dept": "Admin",
        "coord": MAIN_GATE,
        "color": "#ef4444"
    })
    
    # 6. Emergency Locations
    for key, item in campus_data.get("emergency", {}).items():
        keywords = [item["name"].lower(), f"{key}", f"nearest {key}", f"nearest {key} station", f"nearest {key} route", f"navigate to {key}", f"{key} station", f"{key} route"]
        if key == "hospital":
            keywords.extend(["हॉस्पिटल", "दवाखाना", "रुग्णालय", "डॉक्टर", "इलाज"])
        elif key == "police":
            keywords.extend(["पोलीस", "पोलीस स्टेशन", "थाना", "पोलीस चौकी"])
            
        targets.append({
            "name": item["name"],
            "keywords": keywords,
            "type": "Emergency Contact",
            "dept": "Admin",
            "coord": item["coord"],
            "color": "#ef4444",
            "info": f"Phone: {item['phone']}\nInfo: {item['description']}"
        })
    
    return targets

# Pre-load flattened targets for speedy search
flat_targets = get_flat_targets()


# ==========================================================================
# Local NLP Rule-Based Matcher (Fallback Engine)
# ==========================================================================
def local_nlp_match(user_query):
    query_clean = user_query.lower().strip()
    
    # Transliteration/translation map for Marathi and Hindi inputs
    multilingual_maps = {
        "मुख्य": "main",
        "प्रवेश": "entrance",
        "गेट": "gate",
        "दवाखाना": "hospital",
        "रुग्णालय": "hospital",
        "हॉस्पिटल": "hospital",
        "पोलीस": "police",
        "थाना": "police",
        "स्टेशन": "station",
        "चौकी": "station",
        "ग्रंथालय": "library",
        "पुस्तकालय": "library",
        "प्राचार्य": "principal",
        "केबिन": "cabin",
        "कार्यालय": "office",
        "ऑफिस": "office",
        "विभाग": "department",
        "मदत": "help",
        "नमस्कार": "hello",
        "नमस्ते": "hello",
        "लॅब": "lab",
        "प्रयोगशाळा": "lab"
    }
    
    # Pre-process Devanagari text to map to database keywords
    for devanagari_word, english_equivalent in multilingual_maps.items():
        if devanagari_word in query_clean:
            query_clean = query_clean.replace(devanagari_word, english_equivalent)

    # Try direct keyword scans
    best_match = None
    max_score = 0
    
    for target in flat_targets:
        for keyword in target["keywords"]:
            # Exact match check
            if keyword == query_clean:
                return target, f"Sure! I've located {target['name']}. Let me plot the navigation route on the map for you."
            
            # Substring match check with simple scoring
            if keyword in query_clean:
                score = len(keyword) / len(query_clean)
                if score > max_score:
                    max_score = score
                    best_match = target
                    
    if best_match and max_score > 0.4:
        msg = f"I found a matching location: **{best_match['name']}** ({best_match['type']}). Navigating you there now."
        if "info" in best_match:
            msg += f"\n\n**Faculty Info:**\n{best_match['info']}"
        return best_match, msg
        
    # Check for general keywords if no location is parsed (supporting multilingual fallbacks)
    if "hello" in query_clean or "hi" in query_clean:
        return None, "Hello! I am your SITCOE Campus Navigation Assistant. How can I help you find classrooms, labs, faculty members, or departments today?"
    elif "list" in query_clean or "departments" in query_clean:
        return None, "SITCOE has several departments: Computer Science (CSE), Mechanical (MECH), Civil, Electrical, Electronics & Computer (ECE), AI & Data Science (AIDS), Architecture (AR), Central Library, and Admin. Which one would you like to explore?"
    elif "help" in query_clean:
        return None, "You can search for locations or talk to me like a conversational assistant. Try asking: 'Where is Dr. Patil's cabin?', 'Show me the AI Lab', or 'Take me to CSE Room 43'."
        
    # Default fallback when no route matches
    return None, f"I heard you say: \"{user_query}\". However, I couldn't find a specific classroom, laboratory, or faculty member matching that description. Could you please specify the department or room number?"


# ==========================================================================
# Web Routes
# ==========================================================================

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/tts', methods=['GET'])
def text_to_speech():
    """AI Neural Text-To-Speech (TTS) using edge-tts supporting multiple languages."""
    text = request.args.get('text', '').strip()
    lang = request.args.get('lang', 'en-US').strip()
    if not text:
        return jsonify({"error": "Missing text parameter"}), 400

    # Select appropriate voice based on language parameter
    voice = "en-US-EmmaNeural"
    if lang.startswith("hi"):
        voice = "hi-IN-SwaraNeural"
    elif lang.startswith("mr"):
        # edge-tts supports high quality Marathi voice
        voice = "mr-IN-AarohiNeural"

    async def generate_speech():
        communicate = edge_tts.Communicate(text, voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        return audio_data

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_bytes = loop.run_until_complete(generate_speech())
        loop.close()

        response = make_response(audio_bytes)
        response.headers.set('Content-Type', 'audio/mpeg')
        response.headers.set('Content-Disposition', 'inline', filename='speech.mp3')
        return response
    except Exception as e:
        print(f"TTS Synthesis Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/data', methods=['GET'])
def get_campus_data():
    """Returns the full campus database for UI rendering."""
    return jsonify(campus_data)

@app.route('/api/search', methods=['GET'])
def search_campus():
    """Endpoint for fuzzy query search."""
    query = request.args.get('q', '').strip().lower()
    if not query:
        return jsonify([])
        
    results = []
    for target in flat_targets:
        # Fuzzy ratio check
        for keyword in target["keywords"]:
            if query in keyword or keyword in query:
                results.append({
                    "name": target["name"],
                    "type": target["type"],
                    "dept": target["dept"],
                    "coord": target["coord"],
                    "color": target["color"]
                })
                break # Avoid duplicate hits on same target
                
    # Sort results by match length / quality and limit to 6
    results = sorted(results, key=lambda x: len(x["name"]))[:6]
    return jsonify(results)

@app.route('/api/chat', methods=['POST'])
def chat_assistant():
    """AI Assistant Chat endpoint. Processes message and returns reply + navigation target."""
    data = request.json or {}
    message = data.get("message", "").strip()
    
    if not message:
        return jsonify({"reply": "I couldn't hear or read any input. Please try again.", "navigation": None})
        
    navigation = None
    reply = ""
    
    # If Gemini API is available, use Generative AI
    if model:
        # Construct the context prompt for RAG
        prompt = f"""
You are the AI Campus Navigation Assistant for SITCOE (Sharad Institute of Technology College of Engineering, Yadrav). 
You are friendly, professional, and assist users in finding their way around the campus.

Here is the campus directory and coordinate data:
- Main Gate coordinates: {MAIN_GATE}
- Departments:
{json.dumps(campus_data["departments"], indent=2)}

- Laboratories:
{json.dumps(campus_data["labs"], indent=2)}

- Faculty Cabin Locations:
{json.dumps(campus_data["faculty"], indent=2)}

If the user asks to navigate, find, go to, or show a department, classroom, lab, or faculty member's cabin, you MUST locate it in the database and append a special router tag at the very end of your response like this:
[NAV_ROUTE: {{"coord": [latitude, longitude], "label": "Label Name", "color": "ColorHexCode", "dept": "DEPT_CODE"}}]

Use the following color rules for routes:
- Classrooms / general spaces = "#3b82f6" (Blue)
- Laboratories = "#10b981" (Green)
- Faculty Cabins = "#8b5cf6" (Purple)
- Main Gate / Admin structures / Fallbacks = "#ef4444" (Red)

Example output if asked for Dr. A. B. Patil:
"Dr. A. B. Patil is the Professor and Head of Department for CSE. His cabin is in the HOD Office (Room 53). I will plot the route for you.
[NAV_ROUTE: {{"coord": [16.70800, 74.47950], "label": "Dr. A. B. Patil's Cabin", "color": "#8b5cf6", "dept": "CSE"}}]"

If they ask a general question, just answer conversationally. Always keep your response relatively short and focused.

User Message: "{message}"
Assistant:"""
        try:
            response = model.generate_content(prompt)
            raw_reply = response.text.strip()
            
            # Regex to search for [NAV_ROUTE: {...}] tag in the AI response
            match = re.search(r'\[NAV_ROUTE:\s*(\{.*?\})\s*\]', raw_reply)
            if match:
                try:
                    nav_data = json.loads(match.group(1))
                    navigation = nav_data
                    # Strip the NAV_ROUTE tag from the user-facing text
                    reply = raw_reply.replace(match.group(0), "").strip()
                except Exception as parse_err:
                    print("Error parsing NAV_ROUTE JSON from AI response:", parse_err)
                    reply = raw_reply
            else:
                reply = raw_reply
        except Exception as e:
            print(f"Gemini API invocation error: {e}. Falling back to local NLP engine.")
            target, reply = local_nlp_match(message)
            if target:
                navigation = {
                    "coord": target["coord"],
                    "label": target["name"],
                    "color": target["color"],
                    "dept": target["dept"]
                }
    else:
        # Fallback to local rule-based match
        target, reply = local_nlp_match(message)
        if target:
            navigation = {
                "coord": target["coord"],
                "label": target["name"],
                "color": target["color"],
                "dept": target["dept"]
            }
            
    return jsonify({
        "reply": reply,
        "navigation": navigation
    })

# Start Server
if __name__ == '__main__':
    # Default port is 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
