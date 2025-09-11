package store

import (
	"database/sql"
	"fmt"
	"io/fs"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

func Open() (*sql.DB, error) {
	db, err := sql.Open("pgx", os.Getenv("DB_URL"))

	if err != nil {
		return nil, fmt.Errorf("failed to open db: %w", err)
	}

	fmt.Println("DB Connection Established")

	return db, nil
}

func MigrateFS(db *sql.DB, migrationFS fs.FS, dir string) error {
	goose.SetBaseFS(migrationFS)
	defer func() {
		goose.SetBaseFS(nil)
	}()

	return Migrate(db, dir)
}

func Migrate(db *sql.DB, dir string) error {
	err := goose.SetDialect("postgres")
	if err != nil {
		return fmt.Errorf("migration failed: %v", err)
	}

	err = goose.Up(db, dir)
	if err != nil {
		return fmt.Errorf("goose up failed: %v", err)
	}

	return nil
}
