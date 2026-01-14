import sys
print("Python version:", sys.version)

try:
    print("Importing torch...")
    import torch
    print("Importing librosa...")
    import librosa
    print("Importing soundfile...")
    import soundfile
    print("Importing editdistance (mock)...")
    import editdistance
    print("Importing omegaconf...")
    import omegaconf
    print("Importing hydra...")
    import hydra
    print("Importing nemo.collections.asr...")
    import nemo.collections.asr as nemo_asr
    print("Nemo import successful!")
except ImportError as e:
    print("ImportError:", e)
except Exception as e:
    print("Exception:", e)
