import os
import cv2
import base64
import requests
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, render_template, send_file
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from fpdf import FPDF
from collections import Counter
import torch
# Import Conv from ultralytics; this must match the package structure in ultralytics==8.0.61.
from ultralytics.nn.modules.conv import Conv


app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize YOLO model with your weights file.
model = YOLO("model.pt")  # Ensure this path is correct relative to your project

# Define class mapping (currency labels, currencies, and denominations)
class_mapping = {
    0: {"label": "50 USD", "currency": "USD", "denomination": 50},
    1: {"label": "5 USD", "currency": "USD", "denomination": 5},
    2: {"label": "1 USD", "currency": "USD", "denomination": 1},
    3: {"label": "10 USD", "currency": "USD", "denomination": 10},
    4: {"label": "20 USD", "currency": "USD", "denomination": 20},
    5: {"label": "100 USD", "currency": "USD", "denomination": 100},
    6: {"label": "100 PHP", "currency": "PHP", "denomination": 100},
    7: {"label": "1000 PHP", "currency": "PHP", "denomination": 1000},
    8: {"label": "1000 PHP - NEW", "currency": "PHP", "denomination": 1000},
    9: {"label": "20 PHP", "currency": "PHP", "denomination": 20},
    10: {"label": "200 PHP", "currency": "PHP", "denomination": 200},
    11: {"label": "50 PHP", "currency": "PHP", "denomination": 50},
    12: {"label": "500 PHP", "currency": "PHP", "denomination": 500},
    13: {"label": "100 INR", "currency": "INR", "denomination": 100},
    14: {"label": "10 INR", "currency": "INR", "denomination": 10},
    15: {"label": "200 INR", "currency": "INR", "denomination": 200},
    16: {"label": "20 INR", "currency": "INR", "denomination": 20},
    17: {"label": "500 INR", "currency": "INR", "denomination": 500},
    18: {"label": "50 INR", "currency": "INR", "denomination": 50},
    19: {"label": "2000 INR", "currency": "INR", "denomination": 2000},
    20: {"label": "100 EURO", "currency": "EURO", "denomination": 100},
    21: {"label": "10 EURO", "currency": "EURO", "denomination": 10},
    22: {"label": "200 EURO", "currency": "EURO", "denomination": 200},
    23: {"label": "20 EURO", "currency": "EURO", "denomination": 20},
    24: {"label": "50 EURO", "currency": "EURO", "denomination": 50},
    25: {"label": "5 EURO", "currency": "EURO", "denomination": 5},
}

def get_conversion_rate(base, target):
    try:
        res = requests.get(f"https://api.exchangerate-api.com/v4/latest/{base}")
        return res.json()["rates"].get(target, 1)
    except Exception:
        return 1

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    target_currency = request.form.get('target_currency', 'INR').upper()
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    filename = secure_filename(file.filename or "captured.jpg")
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)

    # Run YOLO prediction on the uploaded image
    results = model.predict(source=path, conf=0.25, imgsz=1260)
    result = results[0]
    image = cv2.imread(path)
    annotated = result.plot()
    _, buffer = cv2.imencode('.jpg', annotated)
    image_b64 = base64.b64encode(buffer).decode('utf-8')

    xyxy = result.boxes.xyxy.cpu().numpy() if result.boxes.xyxy is not None else []
    cls_arr = result.boxes.cls.cpu().numpy() if result.boxes.cls is not None else []
    counts = Counter(cls_arr.astype(int))
    orig_pil = Image.open(path)
    thumb_paths = {}

    # Create thumbnails for each detected class
    for i, cls in enumerate(cls_arr.astype(int)):
        if cls in thumb_paths:
            continue
        mapping = class_mapping.get(cls)
        if not mapping:
            continue
        x1, y1, x2, y2 = xyxy[i]
        thumb_img = orig_pil.crop((x1, y1, x2, y2)).resize((100, 100))
        thumb_file = f"thumb_{cls}.jpg"
        thumb_path = os.path.join(app.config['UPLOAD_FOLDER'], thumb_file)
        thumb_img.save(thumb_path)
        thumb_paths[cls] = thumb_file

    # Build prediction summary
    rows_list = []
    for cls, count in counts.items():
        mapping = class_mapping.get(cls)
        if not mapping:
            continue
        denom = mapping["denomination"]
        total = denom * count
        rows_list.append({
            "Label": mapping["label"],
            "Currency": mapping["currency"],
            "Denomination": denom,
            "Count": count,
            "Total": total,
            "Thumbnail": thumb_paths.get(cls, "")
        })

    # Calculate totals and perform currency conversion
    totals_by_currency = {}
    for row in rows_list:
        totals_by_currency[row["Currency"]] = totals_by_currency.get(row["Currency"], 0) + row["Total"]

    converted_total = 0.0
    for cur, amt in totals_by_currency.items():
        rate = get_conversion_rate(cur, target_currency)
        converted_total += amt * rate

    # Generate a PDF report with the results
    report_path = os.path.join(app.config['UPLOAD_FOLDER'], "report.pdf")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Currency Detection Report", ln=1, align='C')
    pdf.ln(5)

    pdf.set_font("Arial", "", 12)
    pdf.cell(40, 10, "Label", 1)
    pdf.cell(30, 10, "Currency", 1)
    pdf.cell(25, 10, "Denom.", 1)
    pdf.cell(20, 10, "Count", 1)
    pdf.cell(25, 10, "Total", 1)
    pdf.cell(40, 10, "Thumbnail", 1)
    pdf.ln()

    for row in rows_list:
        pdf.cell(40, 30, row["Label"], 1)
        pdf.cell(30, 30, row["Currency"], 1)
        pdf.cell(25, 30, str(row["Denomination"]), 1)
        pdf.cell(20, 30, str(row["Count"]), 1)
        pdf.cell(25, 30, str(row["Total"]), 1)
        x = pdf.get_x()
        y = pdf.get_y()
        pdf.cell(40, 30, "", 1)
        thumb_path = os.path.join(app.config['UPLOAD_FOLDER'], row["Thumbnail"])
        if os.path.exists(thumb_path):
            pdf.image(thumb_path, x + 2, y + 2, w=36, h=26)
        pdf.ln()

    pdf.ln(5)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"Final Total in {target_currency}: {converted_total:.2f}", ln=1)
    pdf.output(report_path)

    return jsonify({
        "image": image_b64,
        "predictions": [row["Label"] for row in rows_list],
        "table": rows_list,
        "converted_total": round(converted_total, 2),
        "currency": target_currency,
        "report_url": "/download-report"
    })

@app.route('/download-report')
def download_report():
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], 'report.pdf'), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
