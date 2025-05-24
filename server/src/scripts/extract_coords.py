#!/usr/bin/env python3
import sys, json
from PIL import Image
import pytesseract
from pytesseract import Output

def extract(image_path: str):
    img = Image.open(image_path)
    data = pytesseract.image_to_data(img, lang='ara+eng',
                                     config='--oem 3 --psm 6',
                                     output_type=Output.DICT)
    results = []
    for i, txt in enumerate(data['text']):
        word = txt.strip()
        conf = int(data['conf'][i])
        if not word:
            continue
        # include everything (or conf>threshold)
        results.append({
            'text': word,
            'conf': conf,
            'x': data['left'][i],
            'y': data['top'][i],
            'width': data['width'][i],
            'height': data['height'][i],
        })
    print(json.dumps(results, ensure_ascii=False))

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: extract_coords.py <image_path>", file=sys.stderr)
        sys.exit(1)
    extract(sys.argv[1])
