FROM mysql:8.0

# Copy the custom setup script
COPY docker-setup.sh /docker-entrypoint-initdb.d/99-setup.sh

# Fix line endings for Windows compatibility
RUN sed -i 's/\r$//' /docker-entrypoint-initdb.d/99-setup.sh
