const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function runScript(db, script) {
  const sql = fs.readFileSync(script, 'utf8');
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function columnExists(db, tableName, columnName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName});`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const exists = rows.some(row => row.name === columnName);
        resolve(exists);
      }
    });
  });
}


describe('the ALTER TABLE command in the `exercise.sql` file', () => {
  let db;
  let scriptPath;
  let cleanup;
  let populate;

  beforeAll(async () => {
    const dbPath = path.resolve(__dirname, '..', 'lesson29.db');
    db = new sqlite3.Database(dbPath);

    scriptPath = path.resolve(__dirname, '..', 'exercise.sql');
    cleanup = path.resolve(__dirname, './cleanup.sql');
    populate = path.resolve(__dirname, './populate.sql');

    await runScript(db, cleanup);
    await runScript(db, populate);
  });

  afterAll(async () => {
    await runScript(db, cleanup);
    await runScript(db, populate);
    db.close();
  });

  test('Should correctly alter the Rental_Properties table.', async () => {
    await runScript(db, scriptPath);

    const monthlyRentExists = await columnExists(db, 'Rental_Properties', 'MONTHLY_RENT');
    expect(monthlyRentExists).toBeTruthy();

    const placeHolderExists = await columnExists(db, 'Rental_Properties', 'PLACE_HOLDER');
    const ownerIdExists = await columnExists(db, 'Rental_Properties', 'OWNER_ID');
    expect(placeHolderExists).toBeFalsy();
    expect(ownerIdExists).toBeTruthy();
  });
});

