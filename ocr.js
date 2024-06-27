document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const imageUrl = reader.result;

            // Call the OCR API
            processImage(imageUrl);
        };
        reader.readAsDataURL(file);
    }
});

async function processImage(imageUrl) {
    const endpoint = 'YOUR_ENDPOINT';
    const subscriptionKey = 'YOUR_SUBSCRIPTION_KEY';

    const uriBase = `${endpoint}/vision/v3.2/ocr`;
    
    const params = {
        "language": "unk",
        "detectOrientation": "true",
    };

    try {
        const response = await fetch(`${uriBase}?${new URLSearchParams(params)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            },
            body: makeBlob(imageUrl),
        });

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function makeBlob(dataURL) {
    const BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        const parts = dataURL.split(',');
        const contentType = parts[0].split(':')[1];
        const raw = decodeURIComponent(parts[1]);

        return new Blob([raw], { type: contentType });
    }

    const parts = dataURL.split(BASE64_MARKER);
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;

    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    // Check if regions array exists and has elements
    if (!data.regions || data.regions.length === 0) {
        resultDiv.innerHTML = '<p>No text found in the image.</p>';
        console.log('No regions or empty regions array found in API response:', data);
        return;
    }

    // Iterate over regions, lines, and words to display text
    const regions = data.regions;
    for (const region of regions) {
        if (!region.lines) continue; // Skip if no lines found in the region
        for (const line of region.lines) {
            let text = '';
            if (!line.words) continue; // Skip if no words found in the line
            for (const word of line.words) {
                text += word.text + ' ';
            }
            resultDiv.innerHTML += `<p>${text.trim()}</p>`;
        }
    }
}


