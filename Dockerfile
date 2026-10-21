FROM php:8.2-apache

# Install PostgreSQL extensions for PHP
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pgsql pdo_pgsql

# Enable Apache Mod_Rewrite
RUN a2enmod rewrite

# Copy all project files to Apache server directory
COPY . /var/www/html/

# Expose port 80
EXPOSE 80