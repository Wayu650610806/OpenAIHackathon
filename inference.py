import argparse
from collections import OrderedDict

import torch
import torch.nn as nn


class SimpleLSTM(nn.Module):
    """Placeholder LSTM architecture.

    IMPORTANT:
    Change input_size, hidden_size, num_layers, and num_classes to exactly
    match the values used when training simple_lstm_best.pth.
    """

    def __init__(self, input_size, hidden_size, num_layers, num_classes):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
        )
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        # Expected x shape: (batch_size, sequence_length, input_size)
        out, _ = self.lstm(x)

        # Use the last time step for classification.
        out = out[:, -1, :]
        logits = self.fc(out)
        return logits


def _strip_module_prefix(state_dict):
    """Remove DataParallel 'module.' prefixes if they exist."""
    cleaned = OrderedDict()
    for key, value in state_dict.items():
        cleaned[key.replace("module.", "", 1) if key.startswith("module.") else key] = value
    return cleaned


def load_model(
    model_path,
    input_size,
    hidden_size,
    num_layers,
    num_classes,
    device=None,
):
    """Load a PyTorch .pth model.

    This supports common checkpoint formats:
    1. a full torch.nn.Module saved with torch.save(model, path)
    2. a raw state_dict saved with torch.save(model.state_dict(), path)
    3. a checkpoint dict containing keys such as 'state_dict' or 'model_state_dict'

    If your .pth file is a state_dict, the SimpleLSTM architecture below must
    match the architecture used during training.
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    checkpoint = torch.load(model_path, map_location=device)

    if isinstance(checkpoint, nn.Module):
        model = checkpoint
        model.to(device)
        model.eval()
        return model

    model = SimpleLSTM(
        input_size=input_size,
        hidden_size=hidden_size,
        num_layers=num_layers,
        num_classes=num_classes,
    )

    if isinstance(checkpoint, dict):
        if "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]
        elif "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        else:
            state_dict = checkpoint
    else:
        raise TypeError(
            "Unsupported checkpoint format. Expected a PyTorch module, state_dict, or checkpoint dict."
        )

    state_dict = _strip_module_prefix(state_dict)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model


def predict(model, x, device=None):
    """Run inference and return predicted class indices.

    x should be a torch.Tensor with shape:
    (batch_size, sequence_length, input_size)
    """
    if device is None:
        device = next(model.parameters()).device

    model.eval()
    x = x.to(device)
    with torch.no_grad():
        logits = model(x)
        predicted_class = torch.argmax(logits, dim=1)
    return predicted_class


def parse_args():
    parser = argparse.ArgumentParser(description="Load a WiFi CSI HAR LSTM PyTorch model.")
    parser.add_argument("--model_path", default="simple_lstm_best.pth")

    # TODO: Change these values to match the training configuration.
    parser.add_argument("--input_size", type=int, default=128)
    parser.add_argument("--hidden_size", type=int, default=64)
    parser.add_argument("--num_layers", type=int, default=2)
    parser.add_argument("--num_classes", type=int, default=6)

    # Example dummy input settings. Change these to match your CSI sequence format.
    parser.add_argument("--sequence_length", type=int, default=100)
    parser.add_argument("--batch_size", type=int, default=1)
    return parser.parse_args()


def main():
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = load_model(
        model_path=args.model_path,
        input_size=args.input_size,
        hidden_size=args.hidden_size,
        num_layers=args.num_layers,
        num_classes=args.num_classes,
        device=device,
    )

    # Dummy CSI input example only.
    # Replace this with the same preprocessing used during training.
    sample = torch.randn(args.batch_size, args.sequence_length, args.input_size)
    prediction = predict(model, sample, device=device)

    print("Predicted class index:", prediction.cpu().tolist())


if __name__ == "__main__":
    main()
