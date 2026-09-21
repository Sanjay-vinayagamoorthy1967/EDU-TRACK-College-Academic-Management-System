# MySQL Database Setup for EduTrack

## Overview
Using **MySQL** database with password **12345** for the Student Success Hub application.

## Connection Details
- **Host**: localhost
- **Port**: 3306 (MySQL default)
- **Database**: edutrack
- **User**: root
- **Password**: 12345
- **Connection String**: `mysql://root:12345@localhost:3306/edutrack`

## Quick Setup

### 1. Install MySQL
- **Windows**: Download from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
- **Mac**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`

### 2. Start MySQL Service
```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 3. Set Root Password to 12345
```bash
# Login to MySQL
mysql -u root

# Set password
ALTER USER 'root'@'localhost' IDENTIFIED BY '12345';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Create Database
```bash
# Login with new password
mysql -u root -p12345

# Create database
CREATE DATABASE edutrack;

# Verify
SHOW DATABASES;
USE edutrack;
EXIT;
```

### 5. Run Prisma Migrations
```bash
cd server

# Generate Prisma client
npx prisma generate

# Create tables
npx prisma migrate dev --name init

# Seed data
npm run prisma:seed
```

## Verify Setup

### Check MySQL Connection
```bash
mysql -u root -p12345 -e "SELECT VERSION();"
```

### Check Database
```bash
mysql -u root -p12345 edutrack -e "SHOW TABLES;"
```

### Use Prisma Studio
```bash
cd server
npx prisma studio
```
Opens at `http://localhost:5555`

## Common MySQL Commands

### Connect to Database
```bash
mysql -u root -p12345 edutrack
```

### Show Tables
```sql
SHOW TABLES;
```

### Describe Table
```sql
DESCRIBE User;
DESCRIBE Student;
```

### View Data
```sql
SELECT * FROM User;
SELECT * FROM Student LIMIT 10;
```

### Backup Database
```bash
mysqldump -u root -p12345 edutrack > backup.sql
```

### Restore Database
```bash
mysql -u root -p12345 edutrack < backup.sql
```

## Troubleshooting

### "Access denied for user 'root'"
```bash
# Reset root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY '12345';
FLUSH PRIVILEGES;
EXIT;
```

### "Can't connect to MySQL server"
```bash
# Check if MySQL is running
# Windows
sc query MySQL80

# Mac/Linux
sudo systemctl status mysql
```

### "Database 'edutrack' doesn't exist"
```bash
mysql -u root -p12345 -e "CREATE DATABASE edutrack;"
```

## MySQL vs PostgreSQL Differences

Prisma handles most differences automatically, but note:
- ✅ Auto-increment IDs work the same
- ✅ UUIDs supported
- ✅ JSON fields supported
- ✅ All relationships work identically
- ✅ Migrations handled by Prisma

## Performance Tips

### Enable Query Cache
```sql
SET GLOBAL query_cache_size = 67108864;
SET GLOBAL query_cache_type = 1;
```

### Check Performance
```sql
SHOW STATUS LIKE 'Qcache%';
SHOW PROCESSLIST;
```

---

**Database**: MySQL 8.0+  
**Password**: 12345  
**Status**: ✅ Ready for Production
