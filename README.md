# WiFi CSI HAR LSTM

Ready-to-use PyTorch LSTM model for WiFi CSI Human Activity Recognition.

## Files

```text
wifi-csi-har-lstm/
|-- inference.py
|-- labels.json
|-- model_config.json
|-- requirements.txt
|-- simple_lstm_best.pth
`-- upload_to_hf.py
```

## Model Contract

- Model file: `simple_lstm_best.pth`
- Architecture: 2-layer LSTM + `hidden2label` classifier
- Input tensor shape: `(batch, 1024, 468)`
- Single-sample input shape also accepted: `(1024, 468)`
- Output classes:
  - `standing`
  - `walking`
  - `get_down`
  - `sitting`
  - `get_up`
  - `lying`
  - `no_person`

## Backend Usage

Install dependencies:

```bash
pip install -r requirements.txt
```

Use the cached predictor in backend code so the model is loaded only once:

```python
from inference import get_predictor

predictor = get_predictor()

def classify_csi(csi_array):
    # csi_array can be a Python list, NumPy array, or torch.Tensor.
    # Accepted shapes: (1024, 468) or (batch, 1024, 468).
    return predictor.predict(csi_array)
```

Example response:

```json
{
  "predictions": [
    {
      "class_index": 0,
      "label": "standing",
      "confidence": 0.98,
      "probabilities": {
        "standing": 0.98,
        "walking": 0.01,
        "get_down": 0.0,
        "sitting": 0.0,
        "get_up": 0.0,
        "lying": 0.0,
        "no_person": 0.01
      }
    }
  ]
}
```

## FastAPI Example

```python
from fastapi import FastAPI
from pydantic import BaseModel

from inference import get_predictor

app = FastAPI()
predictor = get_predictor()


class PredictRequest(BaseModel):
    csi: list


@app.post("/predict")
def predict(request: PredictRequest):
    return predictor.predict(request.csi)
```

## CLI Test

Run with a zero-filled sample to verify the model can load:

```bash
python inference.py
```

Run with JSON input:

```bash
python inference.py --input_json sample.json
```
