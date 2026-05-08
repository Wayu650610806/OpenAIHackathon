import argparse
import json
from collections import OrderedDict
from pathlib import Path
from typing import Any, Dict, Iterable, Mapping, Optional, Union

import numpy as np
import torch
import torch.nn as nn


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = BASE_DIR / "simple_lstm_best.pth"

DEFAULT_CONFIG = {
    "model_name": "simple_lstm",
    "input_dim": 468,
    "sequence_length": 1024,
    "hidden_size": 256,
    "num_layers": 2,
    "num_classes": 7,
    "class_to_idx": {
        "standing": 0,
        "walking": 1,
        "get_down": 2,
        "sitting": 3,
        "get_up": 4,
        "lying": 5,
        "no_person": 6,
    },
}


class SimpleLSTM(nn.Module):
    """LSTM architecture used by simple_lstm_best.pth."""

    def __init__(
        self,
        input_dim: int = DEFAULT_CONFIG["input_dim"],
        hidden_size: int = DEFAULT_CONFIG["hidden_size"],
        num_layers: int = DEFAULT_CONFIG["num_layers"],
        num_classes: int = DEFAULT_CONFIG["num_classes"],
    ):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.num_classes = num_classes

        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
        )
        self.hidden2label = nn.Linear(hidden_size, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Expected input shape: (batch_size, sequence_length, input_dim)
        out, _ = self.lstm(x)
        return self.hidden2label(out[:, -1, :])


def _strip_module_prefix(state_dict: Mapping[str, Any]) -> OrderedDict:
    cleaned = OrderedDict()
    for key, value in state_dict.items():
        cleaned[key.replace("module.", "", 1) if key.startswith("module.") else key] = value
    return cleaned


def _load_checkpoint(model_path: Union[str, Path], device: torch.device) -> Dict[str, Any]:
    checkpoint = torch.load(str(model_path), map_location=device)
    if not isinstance(checkpoint, dict):
        raise TypeError("Expected simple_lstm_best.pth to contain a checkpoint dictionary.")
    return checkpoint


def load_config(model_path: Union[str, Path] = DEFAULT_MODEL_PATH) -> Dict[str, Any]:
    """Return model metadata from the checkpoint, with safe defaults."""
    checkpoint = torch.load(str(model_path), map_location="cpu")
    config = dict(DEFAULT_CONFIG)
    if isinstance(checkpoint, dict):
        config.update(
            {
                "model_name": checkpoint.get("model_name", config["model_name"]),
                "input_dim": checkpoint.get("input_dim", config["input_dim"]),
                "sequence_length": checkpoint.get("seq_dim", config["sequence_length"]),
                "class_to_idx": checkpoint.get("class_to_idx", config["class_to_idx"]),
            }
        )
        config["num_classes"] = len(config["class_to_idx"])

        state_dict = checkpoint.get("model_state_dict") or checkpoint.get("state_dict")
        if state_dict:
            state_dict = _strip_module_prefix(state_dict)
            weight_hh = state_dict.get("lstm.weight_hh_l0")
            if weight_hh is not None:
                config["hidden_size"] = weight_hh.shape[1]
            layer_ids = {
                int(key.rsplit("_l", 1)[1])
                for key in state_dict
                if key.startswith("lstm.weight_ih_l") and key.rsplit("_l", 1)[1].isdigit()
            }
            if layer_ids:
                config["num_layers"] = max(layer_ids) + 1
    return config


def load_model(
    model_path: Union[str, Path] = DEFAULT_MODEL_PATH,
    device: Optional[Union[str, torch.device]] = None,
) -> SimpleLSTM:
    """Load the trained WiFi CSI HAR model and return it in eval mode."""
    device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
    checkpoint = _load_checkpoint(model_path, device)
    config = load_config(model_path)

    model = SimpleLSTM(
        input_dim=config["input_dim"],
        hidden_size=config["hidden_size"],
        num_layers=config["num_layers"],
        num_classes=config["num_classes"],
    )

    state_dict = checkpoint.get("model_state_dict") or checkpoint.get("state_dict")
    if state_dict is None:
        raise KeyError("Checkpoint does not contain 'model_state_dict' or 'state_dict'.")

    model.load_state_dict(_strip_module_prefix(state_dict))
    model.to(device)
    model.eval()
    return model


def prepare_input(data: Union[torch.Tensor, np.ndarray, Iterable[Any]]) -> torch.Tensor:
    """Convert CSI input to float32 tensor with shape (batch, sequence, input_dim)."""
    if isinstance(data, torch.Tensor):
        tensor = data.detach().clone().float()
    else:
        tensor = torch.as_tensor(np.asarray(data), dtype=torch.float32)

    if tensor.ndim == 2:
        tensor = tensor.unsqueeze(0)
    if tensor.ndim != 3:
        raise ValueError("Input must have shape (sequence, 468) or (batch, sequence, 468).")
    if tensor.shape[-1] != DEFAULT_CONFIG["input_dim"]:
        raise ValueError(f"Expected input_dim={DEFAULT_CONFIG['input_dim']}, got {tensor.shape[-1]}.")
    return tensor


class WifiCsiHarPredictor:
    """Small backend-friendly wrapper around the trained model."""

    def __init__(
        self,
        model_path: Union[str, Path] = DEFAULT_MODEL_PATH,
        device: Optional[Union[str, torch.device]] = None,
    ):
        self.model_path = Path(model_path)
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
        self.config = load_config(self.model_path)
        self.class_to_idx = self.config["class_to_idx"]
        self.idx_to_class = {idx: label for label, idx in self.class_to_idx.items()}
        self.model = load_model(self.model_path, self.device)

    def predict(self, data: Union[torch.Tensor, np.ndarray, Iterable[Any]]) -> Dict[str, Any]:
        tensor = prepare_input(data).to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            probabilities = torch.softmax(logits, dim=1)
            confidence, prediction = torch.max(probabilities, dim=1)

        results = []
        for index, score, probs in zip(prediction.cpu().tolist(), confidence.cpu().tolist(), probabilities.cpu()):
            results.append(
                {
                    "class_index": int(index),
                    "label": self.idx_to_class[int(index)],
                    "confidence": float(score),
                    "probabilities": {
                        self.idx_to_class[i]: float(prob)
                        for i, prob in enumerate(probs.tolist())
                    },
                }
            )
        return {"predictions": results}


_PREDICTOR: Optional[WifiCsiHarPredictor] = None


def get_predictor(
    model_path: Union[str, Path] = DEFAULT_MODEL_PATH,
    device: Optional[Union[str, torch.device]] = None,
) -> WifiCsiHarPredictor:
    """Return a cached predictor so backend routes do not reload the model per request."""
    global _PREDICTOR
    if _PREDICTOR is None:
        _PREDICTOR = WifiCsiHarPredictor(model_path=model_path, device=device)
    return _PREDICTOR


def predict(data: Union[torch.Tensor, np.ndarray, Iterable[Any]]) -> Dict[str, Any]:
    """Convenience function for simple backend usage."""
    return get_predictor().predict(data)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run WiFi CSI HAR LSTM inference.")
    parser.add_argument("--model_path", default=str(DEFAULT_MODEL_PATH))
    parser.add_argument("--input_json", help="Path to JSON containing a 2D or 3D CSI array.")
    parser.add_argument("--device", default=None, help="Optional torch device, e.g. cpu or cuda.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    predictor = WifiCsiHarPredictor(model_path=args.model_path, device=args.device)

    if args.input_json:
        with open(args.input_json, "r", encoding="utf-8") as file:
            data = json.load(file)
    else:
        data = np.zeros(
            (1, predictor.config["sequence_length"], predictor.config["input_dim"]),
            dtype=np.float32,
        )

    print(json.dumps(predictor.predict(data), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
