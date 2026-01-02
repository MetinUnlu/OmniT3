#!/bin/sh
# Generate htpasswd file from environment variables
# Used for nginx, on production environment, to secure Prisma Studio

if [ -z "$STUDIO_USERNAME" ] || [ -z "$STUDIO_PASSWORD" ]; then
    echo "Error: STUDIO_USERNAME and STUDIO_PASSWORD must be set"
    exit 1
fi

# Install apache2-utils if not present (for htpasswd command)
apk add --no-cache apache2-utils

# Generate password file
htpasswd -bc /etc/nginx/.htpasswd "$STUDIO_USERNAME" "$STUDIO_PASSWORD"

echo "✅ Password file generated successfully"