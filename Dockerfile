# Build stage for frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ ./
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN yarn build

# Production stage
FROM node:18-alpine AS production

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy backend
COPY backend/requirements.txt ./backend/
RUN pip3 install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Install serve for frontend
RUN npm install -g serve

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/backend && python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 &' >> /app/start.sh && \
    echo 'serve -s /app/frontend/build -l 3000' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000 8001

CMD ["/app/start.sh"]
