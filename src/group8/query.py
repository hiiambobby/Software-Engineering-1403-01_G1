import mysql.connector as mysql
from database.secret import DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

# Define a function to create a connection to the database
def create_db_connection():
    try:
        mydb = mysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            ssl_disabled=False  # Ensure SSL is enabled if required
        )
        print("Connection to MySQL DB successful")
        return mydb
    except mysql.connector.Error as e:
        print(f"The error '{e}' occurred")
        return None

# Define a function to create a table
def create_table(mydb, create_table_query):
    cursor = mydb.cursor()
    try:
        cursor.execute(create_table_query)
        mydb.commit()
        print("Table created successfully")
    except mysql.connector.Error as e:
        print(f"The error '{e}' occurred")

# Example usage
if __name__ == "__main__":
    db_connection = create_db_connection()
    if db_connection:
        create_like_table_query = """
        CREATE TABLE IF NOT EXISTS `like` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NOT NULL,
            `item_id` INT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
            FOREIGN KEY (`item_id`) REFERENCES `items`(`id`)
        );
        """
        create_table(db_connection, create_like_table_query)