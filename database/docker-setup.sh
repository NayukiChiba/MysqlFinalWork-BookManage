#!/bin/bash
cd /docker-entrypoint-initdb.d

echo "Starting database initialization..."

MYSQL_CMD="mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE}"

# Function to run sql files
run_sql() {
    echo "Running $1..."
    $MYSQL_CMD < "$1"
}

# Run setup in order
# Create tables
for f in schema/tables/*/*.sql; do run_sql "$f"; done

# Create functions
for f in schema/functions/*/*.sql; do run_sql "$f"; done

# Create procedures
for f in schema/procedures/*/*.sql; do run_sql "$f"; done

# Create triggers
for f in schema/triggers/*/*.sql; do run_sql "$f"; done

# Create events
for f in schema/events/*/*.sql; do run_sql "$f"; done

# Insert seeds
for f in seeds/*.sql; do run_sql "$f"; done

# Super admin from env
if [ ! -z "$SUPER_ADMIN_NAME" ]; then
    echo "Creating super admin..."
    mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} -e "set @super_admin_name='$SUPER_ADMIN_NAME'; set @super_admin_password='$SUPER_ADMIN_PASSWORD'; set @super_admin_phone='$SUPER_ADMIN_PHONE'; source seeds/super_admin.sql;"
fi

echo "Initialization complete."
