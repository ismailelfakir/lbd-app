# Setup Instructions

## Quick Start

### Backend (Spring Boot)

1. **Fix pom.xml** (Important!):
   - Open `backend/pom.xml`
   - Find line 15: `<n>ILP Backend</n>`
   - Replace with: `<name>ILP Backend</name>`

2. **Install and Run**:
   ```bash
   cd backend
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

3. **MongoDB Setup**:
   - Install MongoDB locally or use MongoDB Atlas
   - Update `application.yml` with your MongoDB connection string
   - Default: `mongodb://localhost:27017/ilpdb`

### Frontend (Angular)

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**:
   ```bash
   ng serve
   ```

3. **Access Application**:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080

## Troubleshooting

### pom.xml Error
If you see an XML parsing error in `backend/pom.xml`, ensure line 15 has `<name>ILP Backend</name>` instead of `<n>ILP Backend</n>`.

### MongoDB Connection
- Ensure MongoDB is running
- Check connection string in `backend/src/main/resources/application.yml`
- For MongoDB Atlas, use: `mongodb+srv://user:password@cluster.mongodb.net/ilpdb`

### CORS Issues
- Backend allows `http://localhost:4200` by default
- Update `SecurityConfig.java` if using a different port

### Angular Build Issues
- Ensure Node.js 18+ is installed
- Run `npm cache clean --force` if dependency issues occur
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

