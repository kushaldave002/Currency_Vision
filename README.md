# Currency_Vision

CurrencyVision is a web application that uses machine learning and computer vision techniques to analyze and detect currency denominations from images. The project aims to help users identify and count various currencies from different countries, providing quick and accurate results.

## Dataset

The multi-currency dataset (1.3 GB, 36 classes: USD, PHP, INR, EUR, AUD, CAD) is publicly available:

> **Ultralytics Hub:**  
> https://hub.ultralytics.com/datasets/LIlVXj6GtnwV3fA91mwM

Clone or download and place its `data/` folder alongside `dataset.yaml`.

## Technologies Used
- Google Colab (T4 GPU with 15GB VRAM), Ultralytics_Hub, Wandb.ai (To train custom model),  


### Requirements

- Python 3.x
- YOLOv8 (for currency detection)
- `requirements.txt` for all necessary dependencies


### Installation

1. Clone this repository  
   ```bash
   git clone https://github.com/yourname/CurrencyVision.git
   cd CurrencyVision


## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes and commit (`git commit -am 'Add new feature'`).
4. Push to your branch (`git push origin feature-name`).
5. Create a pull request.

Please make sure to follow the code formatting guidelines and add relevant tests for any new functionality.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
