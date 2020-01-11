#!/bin/bash
# We need to host a local webserver because browsers will deny
# requests to load any other local mp3 and js files because of CORS
python -m http.server
