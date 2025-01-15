# Word Learning With Pictures Microservice

This microservice is part of a larger project designed for users to learn vocabulary with associated images. It provides features such as adding new words, categorizing them, tracking learning progress, and interacting with word lists. The backend is built using Django, and the database used is the default SQLite database provided by Django.

## Features

- **Add Words:** Users can add new words, select their categories, levels, and upload associated images.
- **Track Progress:** Users can track their learning progress across different categories and levels.
- **Word Management:** Users can mark words as learned, edit existing words, or delete words.
- **Search and Filter:** Search for words based on title, category, or level.
- **User Authentication:** Secure login, signup, and logout functionalities.

## Microservice Architecture

This microservice interacts with other microservices in the larger project. To ensure proper functionality, the following actions must be performed to connect with other microservices:

1. **Registration Microservice:**
   - Users need to register through the `registration` microservice before they can access this microservice.
   - Ensure the registration microservice is running and accessible.

2. **Group Microservices:**
   - The project supports multiple groups, each represented by a separate microservice (e.g., `group1`, `group2`).
   - The `group8` microservice works independently but connects to the main system for user authentication and progress tracking.

3. **Database Integration:**
   - Ensure the default SQLite database is properly initialized for this microservice.
   - Use the Django migration commands to set up the database schema.

---

## Installation

### Prerequisites
- Python 3.8+
- Django 4.0+
- Git

### Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/word-learning-microservice.git
   cd word-learning-microservice/src


We used django as the backend for this service. The backend is a REST API that is used by the frontend to register ads and get the ads.

## Installation

First thing first, install the requirements:

```bash
pip install -r requirements.txt
```
## Apply Migrations

```bash
python manage.py migrate
```

## Usage

To run this project simply run the following command:

```bash
python manage.py runserver
```

Then open your browser and go to `http://localhost:8000/` to see the project.



Then add the following line:

```python

DB_NAME = 'defaultdb'
DB_USER = 'avnadmin'
DB_PASSWORD = 'AVNS_QXs1v9qBTveDtLIXZfW'
DB_HOST = 'mysql-374f4726-majidnamiiiii-e945.a.aivencloud.com'
DB_PORT = '11741'
