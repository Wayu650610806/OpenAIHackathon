# WiFi CSI HAR LSTM

PyTorch LSTM model for WiFi CSI Human Activity Recognition.

This repository contains a trained `.pth` model file and a minimal inference example so other users can download the model and load it in their own PyTorch projects.

## Files

```text
wifi-csi-har-lstm/
├── README.md
├── requirements.txt
├── inference.py
└── simple_lstm_best.pth
```

## Model Details

- Task: WiFi CSI Human Activity Recognition
- Model type: PyTorch LSTM
- Model file: `simple_lstm_best.pth`
- Format: `.pth`
- Note: The file may contain either a full PyTorch model or a `state_dict`.

## Installation

Clone this repository and install dependencies:

```bash
git clone https://huggingface.co/YOUR_USERNAME/wifi-csi-har-lstm
cd wifi-csi-har-lstm
pip install -r requirements.txt
```

Replace `YOUR_USERNAME` with your Hugging Face username.

## Inference

Run:

```bash
python inference.py --model_path simple_lstm_best.pth
```

Important: If `simple_lstm_best.pth` is a `state_dict`, you must edit the placeholder model configuration in `inference.py` so it matches the values used during training:

- `input_size`
- `hidden_size`
- `num_layers`
- `num_classes`

You may also need to adjust the input preprocessing so it matches your WiFi CSI training pipeline.

## Example Usage

```python
import torch
from inference import SimpleLSTM, load_model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = load_model(
    model_path="simple_lstm_best.pth",
    input_size=128,      # TODO: change to your training value
    hidden_size=64,      # TODO: change to your training value
    num_layers=2,        # TODO: change to your training value
    num_classes=6,       # TODO: change to your training value
    device=device,
)

model.eval()

# Example input shape: (batch_size, sequence_length, input_size)
x = torch.randn(1, 100, 128).to(device)

with torch.no_grad():
    logits = model(x)
    prediction = torch.argmax(logits, dim=1)

print(prediction.item())
```

## Uploading to Hugging Face

See the deployment steps below if you are preparing this repository locally.

## License

Add your preferred license here before publishing, for example MIT, Apache-2.0, or another license suitable for your dataset/model.
