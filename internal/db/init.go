package db

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

func ensureDatabaseExists(user, pass, host, port, dbName string) error {
	// Connect to MySQL without selecting a database
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/", user, pass, host, port)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return err
	}
	defer db.Close()

	// Create the database if it doesn't exist
	_, err = db.Exec("CREATE DATABASE IF NOT EXISTS " + dbName + " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
	return err
}

