# Fake Data Generator

A standalone CLI tool to generate realistic synthetic donors and waitlist recipients for load testing, algorithm simulations, and sandbox environments.

## Privacy & Safety
- **Zero Real Data**: All demographic and medical attributes are mathematically synthesized.
- **ABO Distribution**: Calibrated to match Indian national epidemiological distributions.
- **Geography**: Uses coordinates of verified major public and private transplant centers across India.

## Usage

```bash
# Print 5 donors and 20 recipients to stdout:
python tools/fake-data-generator/generate.py --donors 5 --recipients 20

# Save 50 donors and 300 recipients to a JSON file:
python tools/fake-data-generator/generate.py --donors 50 --recipients 300 --output benchmark_dataset.json
```
