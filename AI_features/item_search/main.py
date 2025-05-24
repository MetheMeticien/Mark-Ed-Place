import psycopg2
from psycopg2 import OperationalError

def create_products_table(cursor):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_title VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_description TEXT,
        image_url TEXT
    );
    """
    cursor.execute(create_table_query)

def insert_dummy_products(cursor):
    dummy_products = [
        ("Wireless Mouse", "LogiMouse M185", "A reliable wireless mouse with long battery life.", "https://example.com/images/mouse.jpg"),
        ("Mechanical Keyboard", "KeyChron K2", "Compact mechanical keyboard with RGB backlight.", "https://example.com/images/keyboard.jpg"),
        ("Gaming Monitor", "ASUS VG248QG", "24” Full HD gaming monitor with 165Hz refresh rate.", "https://example.com/images/monitor.jpg"),
        ("USB-C Hub", "Anker 7-in-1", "Expand your laptop's ports with this 7-in-1 USB-C hub.", "https://example.com/images/hub.jpg")
    ]

    insert_query = """
    INSERT INTO products (product_title, product_name, product_description, image_url)
    VALUES (%s, %s, %s, %s);
    """
    
    for product in dummy_products:
        cursor.execute(insert_query, product)

def main():
    connection_params = {
        'dbname': 'postgres',
        'user': 'postgres',
        'host': 'localhost',
        'port': '5432',
        'password': '1234'
    }

    try:
        connection = psycopg2.connect(**connection_params)
        cursor = connection.cursor()

        create_products_table(cursor)
        insert_dummy_products(cursor)

        connection.commit()
        print("Products table created and dummy items inserted successfully.")

        cursor.close()
        connection.close()

    except OperationalError as e:
        print(f"Database connection error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
