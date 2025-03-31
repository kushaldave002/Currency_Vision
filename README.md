# Currency_Vision

CurrencyVision is a web application that uses machine learning and computer vision techniques to analyze and detect currency denominations from images. The project aims to help users identify and count various currencies from different countries, providing quick and accurate results.

## Features

- Detect and classify various currency denominations (e.g., USD, EUR, INR, PHP).
- Visualize the prediction results with annotated images.
- Provides a downloadable PDF report of the currency detected, including totals, conversions, and images.
- Supports multiple currencies and provides real-time conversion rates.
- Dynamic frontend and backend powered by Flask/Django and deployed on Render.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask/Django)
- **Machine Learning**: YOLOv8 for currency detection
- **Deployment**: Render (Hosting), PostgreSQL (Database)

## Installation

### Requirements

- Python 3.x
- Flask or Django (depending on the backend you choose)
- YOLOv8 (for currency detection)
- `requirements.txt` for all necessary dependencies

### Steps to Install Locally:

1. Clone this repository:
    ```bash
    git clone https://github.com/yourusername/currencyvision.git
    ```

2. Navigate to the project directory:
    ```bash
    cd currencyvision
    ```

3. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Set up the **YOLO model** (make sure you have the trained model file, e.g., `best (1).pt`).

5. Run the application locally:
    ```bash
    python app.py
    ```

   This will start the backend server, and you can access the app at `http://127.0.0.1:5000` in your browser.

## Usage

1. Navigate to the **CurrencyVision** website (either locally or after deployment).
2. Upload an image of currency.
3. The application will analyze the image and classify the different denominations.
4. The results will be displayed, including total value, thumbnails, and a PDF report for download.

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

## Acknowledgements

- **YOLOv8** for real-time object detection.
- **Flask** (or **Django**) for backend web development.
- **Render** for hosting the full-stack web application.
- **OpenAI** for providing the conversational AI assistance.