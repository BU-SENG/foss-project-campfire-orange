# Campus Delivery Tracker - Spring Boot Backend Architecture

## Table of Contents
1. [Project Structure](#project-structure)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Spring Boot Configuration](#spring-boot-configuration)
5. [Security Implementation](#security-implementation)
6. [Entity Models](#entity-models)
7. [Repository Layer](#repository-layer)
8. [Service Layer](#service-layer)
9. [Controller Layer](#controller-layer)
10. [Setup Instructions](#setup-instructions)

---

## Project Structure

```
campus-delivery-tracker-backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── campus/
│       │           └── delivery/
│       │               ├── CampusDeliveryTrackerApplication.java
│       │               ├── config/
│       │               │   └── SecurityConfig.java
│       │               ├── controller/
│       │               │   ├── AuthController.java
│       │               │   ├── DeliveryController.java
│       │               │   └── UserController.java
│       │               ├── model/
│       │               │   ├── User.java
│       │               │   ├── UserRole.java
│       │               │   ├── Delivery.java
│       │               │   └── DeliveryStatus.java
│       │               ├── repository/
│       │               │   ├── UserRepository.java
│       │               │   ├── UserRoleRepository.java
│       │               │   └── DeliveryRepository.java
│       │               ├── service/
│       │               │   ├── UserService.java
│       │               │   └── DeliveryService.java
│       │               ├── dto/
│       │               │   ├── LoginRequest.java
│       │               │   ├── RegisterRequest.java
│       │               │   ├── DeliveryRequest.java
│       │               │   └── DeliveryResponse.java
│       │               └── exception/
│       │                   └── GlobalExceptionHandler.java
│       └── resources/
│           ├── application.properties
│           └── application-dev.properties
├── pom.xml
└── README.md
```

---

## Database Schema

### PostgreSQL Schema Definition

```sql
-- Create ENUM for roles
CREATE TYPE app_role AS ENUM ('STUDENT', 'PERSONNEL', 'ADMIN');

-- Create ENUM for delivery status
CREATE TYPE delivery_status AS ENUM (
    'REQUESTED',
    'ACCEPTED',
    'PICKED_UP',
    'EN_ROUTE',
    'DELIVERED',
    'REJECTED'
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles table (separate for security)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Deliveries table
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    personnel_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    status delivery_status NOT NULL DEFAULT 'REQUESTED',
    notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_deliveries_student_id ON deliveries(student_id);
CREATE INDEX idx_deliveries_personnel_id ON deliveries(personnel_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;
```

---

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
    "email": "student@campus.edu",
    "password": "password123",
    "name": "John Doe"
}

Response: 201 Created
{
    "id": "uuid",
    "email": "student@campus.edu",
    "name": "John Doe",
    "role": "STUDENT"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
    "email": "student@campus.edu",
    "password": "password123"
}

Response: 200 OK
{
    "token": "jwt-token",
    "user": {
        "id": "uuid",
        "email": "student@campus.edu",
        "name": "John Doe",
        "role": "STUDENT"
    }
}
```

### Delivery Endpoints

#### Create Delivery Request (Student)
```
POST /api/deliveries/request
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
    "source": "Main Gate",
    "destination": "Hostel A - Room 201",
    "notes": "Fragile package"
}

Response: 201 Created
{
    "id": "uuid",
    "studentId": "uuid",
    "studentName": "John Doe",
    "source": "Main Gate",
    "destination": "Hostel A - Room 201",
    "status": "REQUESTED",
    "requestedAt": "2024-01-15T10:30:00Z"
}
```

#### Get My Deliveries (Student)
```
GET /api/deliveries/my-deliveries
Authorization: Bearer <token>

Response: 200 OK
[
    {
        "id": "uuid",
        "source": "Main Gate",
        "destination": "Hostel A",
        "status": "EN_ROUTE",
        "personnelName": "Jane Personnel",
        "requestedAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T11:00:00Z"
    }
]
```

#### Get New Requests (Personnel)
```
GET /api/deliveries/new-requests
Authorization: Bearer <token>

Response: 200 OK
[
    {
        "id": "uuid",
        "studentName": "John Doe",
        "source": "Main Gate",
        "destination": "Hostel A",
        "notes": "Fragile",
        "requestedAt": "2024-01-15T10:30:00Z"
    }
]
```

#### Accept Delivery (Personnel)
```
PUT /api/deliveries/{id}/accept
Authorization: Bearer <token>

Response: 200 OK
{
    "id": "uuid",
    "status": "ACCEPTED",
    "personnelId": "uuid",
    "personnelName": "Jane Personnel"
}
```

#### Reject Delivery (Personnel)
```
PUT /api/deliveries/{id}/reject
Authorization: Bearer <token>

Response: 200 OK
{
    "id": "uuid",
    "status": "REJECTED"
}
```

#### Update Delivery Status (Personnel)
```
PUT /api/deliveries/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
    "status": "PICKED_UP"
}

Response: 200 OK
{
    "id": "uuid",
    "status": "PICKED_UP",
    "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### Get All Deliveries (Admin)
```
GET /api/deliveries/all?status=REQUESTED&personnelId=uuid
Authorization: Bearer <token>

Response: 200 OK
[
    {
        "id": "uuid",
        "studentName": "John Doe",
        "personnelName": "Jane Personnel",
        "source": "Main Gate",
        "destination": "Hostel A",
        "status": "EN_ROUTE",
        "requestedAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T11:00:00Z"
    }
]
```

---

## Spring Boot Configuration

### pom.xml Dependencies
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.campus</groupId>
    <artifactId>delivery-tracker</artifactId>
    <version>1.0.0</version>
    <name>Campus Delivery Tracker</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### application.properties
```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/campus_delivery
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true

# JWT Configuration
jwt.secret=your-secret-key-here-change-in-production
jwt.expiration=86400000

# Logging
logging.level.com.campus.delivery=DEBUG
logging.level.org.springframework.security=DEBUG
```

---

## Security Implementation

### SecurityConfig.java
```java
package com.campus.delivery.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/deliveries/request", "/deliveries/my-deliveries")
                    .hasRole("STUDENT")
                .requestMatchers("/deliveries/new-requests", "/deliveries/*/accept",
                                "/deliveries/*/reject", "/deliveries/*/status")
                    .hasRole("PERSONNEL")
                .requestMatchers("/deliveries/all", "/users/**")
                    .hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
```

---

## Entity Models

### User.java
```java
package com.campus.delivery.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### UserRole.java
```java
package com.campus.delivery.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_roles", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "role"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    public enum Role {
        STUDENT, PERSONNEL, ADMIN
    }
}
```

### Delivery.java
```java
package com.campus.delivery.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "deliveries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @ManyToOne
    @JoinColumn(name = "personnel_id")
    private User personnel;
    
    @Column(nullable = false)
    private String source;
    
    @Column(nullable = false)
    private String destination;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.REQUESTED;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum DeliveryStatus {
        REQUESTED, ACCEPTED, PICKED_UP, EN_ROUTE, DELIVERED, REJECTED
    }
}
```

---

## Repository Layer

### UserRepository.java
```java
package com.campus.delivery.repository;

import com.campus.delivery.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### UserRoleRepository.java
```java
package com.campus.delivery.repository;

import com.campus.delivery.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    List<UserRole> findByUserId(UUID userId);
}
```

### DeliveryRepository.java
```java
package com.campus.delivery.repository;

import com.campus.delivery.model.Delivery;
import com.campus.delivery.model.Delivery.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    List<Delivery> findByStudentId(UUID studentId);
    List<Delivery> findByPersonnelId(UUID personnelId);
    List<Delivery> findByStatus(DeliveryStatus status);
    List<Delivery> findByStatusAndPersonnelId(DeliveryStatus status, UUID personnelId);
}
```

---

## Service Layer

### DeliveryService.java
```java
package com.campus.delivery.service;

import com.campus.delivery.model.Delivery;
import com.campus.delivery.model.Delivery.DeliveryStatus;
import com.campus.delivery.model.User;
import com.campus.delivery.repository.DeliveryRepository;
import com.campus.delivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeliveryService {
    
    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Delivery createDelivery(UUID studentId, String source, 
                                   String destination, String notes) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Delivery delivery = Delivery.builder()
            .student(student)
            .source(source)
            .destination(destination)
            .notes(notes)
            .status(DeliveryStatus.REQUESTED)
            .build();
        
        return deliveryRepository.save(delivery);
    }
    
    public List<Delivery> getStudentDeliveries(UUID studentId) {
        return deliveryRepository.findByStudentId(studentId);
    }
    
    public List<Delivery> getNewRequests() {
        return deliveryRepository.findByStatus(DeliveryStatus.REQUESTED);
    }
    
    @Transactional
    public Delivery acceptDelivery(UUID deliveryId, UUID personnelId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
            .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        User personnel = userRepository.findById(personnelId)
            .orElseThrow(() -> new RuntimeException("Personnel not found"));
        
        delivery.setPersonnel(personnel);
        delivery.setStatus(DeliveryStatus.ACCEPTED);
        
        return deliveryRepository.save(delivery);
    }
    
    @Transactional
    public Delivery updateStatus(UUID deliveryId, DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
            .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        delivery.setStatus(status);
        return deliveryRepository.save(delivery);
    }
    
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }
}
```

---

## Controller Layer

### DeliveryController.java
```java
package com.campus.delivery.controller;

import com.campus.delivery.dto.DeliveryRequest;
import com.campus.delivery.dto.DeliveryResponse;
import com.campus.delivery.model.Delivery;
import com.campus.delivery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/deliveries")
@RequiredArgsConstructor
public class DeliveryController {
    
    private final DeliveryService deliveryService;
    
    @PostMapping("/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<DeliveryResponse> createDelivery(
            @RequestBody DeliveryRequest request,
            Authentication authentication) {
        
        UUID studentId = UUID.fromString(authentication.getName());
        Delivery delivery = deliveryService.createDelivery(
            studentId, request.getSource(), 
            request.getDestination(), request.getNotes()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(DeliveryResponse.from(delivery));
    }
    
    @GetMapping("/my-deliveries")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<DeliveryResponse>> getMyDeliveries(
            Authentication authentication) {
        
        UUID studentId = UUID.fromString(authentication.getName());
        List<Delivery> deliveries = deliveryService.getStudentDeliveries(studentId);
        
        return ResponseEntity.ok(deliveries.stream()
            .map(DeliveryResponse::from)
            .collect(Collectors.toList()));
    }
    
    @GetMapping("/new-requests")
    @PreAuthorize("hasRole('PERSONNEL')")
    public ResponseEntity<List<DeliveryResponse>> getNewRequests() {
        List<Delivery> deliveries = deliveryService.getNewRequests();
        return ResponseEntity.ok(deliveries.stream()
            .map(DeliveryResponse::from)
            .collect(Collectors.toList()));
    }
    
    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('PERSONNEL')")
    public ResponseEntity<DeliveryResponse> acceptDelivery(
            @PathVariable UUID id,
            Authentication authentication) {
        
        UUID personnelId = UUID.fromString(authentication.getName());
        Delivery delivery = deliveryService.acceptDelivery(id, personnelId);
        
        return ResponseEntity.ok(DeliveryResponse.from(delivery));
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DeliveryResponse>> getAllDeliveries() {
        List<Delivery> deliveries = deliveryService.getAllDeliveries();
        return ResponseEntity.ok(deliveries.stream()
            .map(DeliveryResponse::from)
            .collect(Collectors.toList()));
    }
}
```

---

## Setup Instructions

### 1. Prerequisites
- Java 17 or higher
- PostgreSQL 14 or higher
- Maven 3.8 or higher

### 2. Database Setup
```bash
# Create database
createdb campus_delivery

# Run the schema SQL from Database Schema section
psql -d campus_delivery -f schema.sql
```

### 3. Application Configuration
1. Update `application.properties` with your PostgreSQL credentials
2. Generate a secure JWT secret key
3. Configure server port if needed

### 4. Build and Run
```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Or run the JAR
java -jar target/delivery-tracker-1.0.0.jar
```

### 5. Test the API
```bash
# Health check
curl http://localhost:8080/api/actuator/health

# Register a user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@campus.edu","password":"test123","name":"Test User"}'
```

---

## Additional Notes

### Security Best Practices
1. Always use HTTPS in production
2. Store JWT secrets securely (use environment variables)
3. Implement rate limiting
4. Add request validation
5. Use role-based access control (RBAC)

### Performance Optimization
1. Add database connection pooling (HikariCP)
2. Implement caching for frequently accessed data
3. Use pagination for large result sets
4. Add database indexes on frequently queried columns

### Testing
1. Write unit tests for services
2. Integration tests for repositories
3. End-to-end tests for controllers
4. Use TestContainers for PostgreSQL in tests

---

**End of Spring Boot Backend Documentation**
