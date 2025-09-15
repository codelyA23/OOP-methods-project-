# Concert Association Management System

A comprehensive web application for managing a concert association, including showtimes, ticketing, seat management, and more.

## Features

- **User Authentication**
  - User registration and login
  - Role-based access control (Admin, Staff, Customer)
  - Secure password hashing

- **Showtime Management**
  - View all available showtimes
  - Filter showtimes by play
  - Book tickets for specific showtimes

- **Play Management**
  - Browse available plays
  - View play details and descriptions
  - Admin can add/edit/delete plays

- **Actor & Director Management**
  - View actor and director profiles
  - Admin can manage actors and directors

- **Seat Management**
  - View seat availability
  - Select and book specific seats
  - Admin can manage seat configurations

- **Ticket Management**
  - View and manage your tickets
  - Cancel bookings (within policy)
  - Download/print tickets

## Tech Stack

- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6+)
  - Responsive design with CSS Grid and Flexbox
  - Font Awesome for icons

- **Backend**:
  - Python with FastAPI
  - SQLAlchemy ORM
  - SQLite database
  - JWT Authentication

## Getting Started

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- Modern web browser

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codelyA23/OOP-methods-project-.git
   cd project-directory
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```bash
   python -m backend.create_tables
   ```

5. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

6. Open `frontend/index.html` in your web browser to access the application.

## Project Structure

```
project/
├── backend/                  # Backend source code
│   ├── api/                  # API endpoints
│   ├── models/               # Database models
│   ├── schemas/              # Pydantic models
│   ├── database.py           # Database configuration
│   └── main.py               # FastAPI application
├── frontend/                 # Frontend source code
│   ├── assets/               # Static assets
│   │   ├── css/              # Stylesheets
│   │   ├── js/               # JavaScript files
│   │   └── images/           # Image assets
│   ├── *.html                # HTML pages
│   └── script.js             # Main JavaScript file
├── tests/                    # Test files
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## API Documentation

Once the backend server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built as part of the Object-Oriented Programming Methods module
- Special thanks to all group members
