#!/usr/bin/sh

echo | openssl s_client -servername localhost -connect localhost:3000 | openssl x509 -noout -dates
