from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, DECIMAL, Table, CHAR, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from sqlalchemy import and_
from .database import Base

# Many-to-Many association tables
Director_Play = Table(
    'director_play', Base.metadata,
    Column('director_id', Integer, ForeignKey('directors.id'), primary_key=True),
    Column('play_id', Integer, ForeignKey('plays.id'), primary_key=True)
)

Actor_Play = Table(
    'actor_play', Base.metadata,
    Column('actor_id', Integer, ForeignKey('actors.id'), primary_key=True),
    Column('play_id', Integer, ForeignKey('plays.id'), primary_key=True)
)

class Play(Base):
    __tablename__ = 'plays'
    id = Column(Integer, primary_key=True)
    title = Column(String(100))
    duration = Column(Integer)
    price = Column(DECIMAL(10, 2))
    genre = Column(String(20))
    synopsis = Column(String(2000))
    showtimes = relationship("ShowTime", back_populates="play", cascade="all, delete-orphan")
    directors = relationship("Director", secondary=Director_Play, back_populates="plays")
    actors = relationship("Actor", secondary=Actor_Play, back_populates="plays")

class Actor(Base):
    __tablename__ = 'actors'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    gender = Column(CHAR(1))
    date_of_birth = Column(Integer)
    plays = relationship("Play", secondary=Actor_Play, back_populates="actors")

class Director(Base):
    __tablename__ = 'directors'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    date_of_birth = Column(Integer)
    citizenship = Column(String(100))
    plays = relationship("Play", secondary=Director_Play, back_populates="directors")

class Customer(Base):
    __tablename__ = 'customers'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    telephone_no = Column(String(100))
    role = Column(String(50), nullable=False, default='customer')  # e.g., 'customer', 'admin'

    tickets = relationship("Ticket", back_populates="customer")

class Seat(Base):
    __tablename__ = 'seats'
    row_no = Column(Integer, primary_key=True)
    seat_no = Column(Integer, primary_key=True)

class ShowTime(Base):
    __tablename__ = 'showtimes'
    date_and_time = Column(DateTime, primary_key=True)
    play_id = Column(Integer, ForeignKey('plays.id', ondelete='CASCADE'), primary_key=True)

    play = relationship("Play", back_populates="showtimes")

    prices = relationship("ShowTimePrice", back_populates="showtime", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="showtime", cascade="all, delete-orphan")


class ShowTimePrice(Base):
    __tablename__ = 'showtime_prices'
    row_no = Column(Integer, ForeignKey('seats.row_no'), primary_key=True)
    seat_no = Column(Integer, ForeignKey('seats.seat_no'), primary_key=True)
    showtime_date_and_time = Column(DateTime, primary_key=True)
    showtime_play_id = Column(Integer, primary_key=True)
    price = Column(DECIMAL(10, 2))

    __table_args__ = (
        ForeignKeyConstraint(
            ['showtime_date_and_time', 'showtime_play_id'],
            ['showtimes.date_and_time', 'showtimes.play_id']
        ),
    )

    showtime = relationship("ShowTime", back_populates="prices")


class Ticket(Base):
    __tablename__ = 'tickets'
    row_no = Column(Integer, ForeignKey('seats.row_no'), primary_key=True)
    seat_no = Column(Integer, ForeignKey('seats.seat_no'), primary_key=True)
    showtime_date_and_time = Column(DateTime, primary_key=True)
    showtime_play_id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.id'), primary_key=True)
    ticket_no = Column(String(10))

    __table_args__ = (
        ForeignKeyConstraint(
            ['showtime_date_and_time', 'showtime_play_id'],
            ['showtimes.date_and_time', 'showtimes.play_id']
        ),
    )

    customer = relationship("Customer", back_populates="tickets")
    showtime = relationship("ShowTime", back_populates="tickets")
