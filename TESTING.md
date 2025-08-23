# Testing and CI/CD Setup Documentation

## Overview

This document provides an overview of the testing and continuous integration/continuous deployment (CI/CD) setup for the Library Management System project.

## Backend Testing Setup

1. **Test Framework**: Jest with TypeScript support
2. **Database Setup**: MongoDB Memory Server for isolated test database
3. **Types of Tests**:
   - Unit tests for models and utilities
   - Integration tests for API endpoints

### Backend Tests

- **Unit Tests**:
  - User Model (`user.model.test.ts`): Tests validation, password hashing, comparison
  - Book Model (`book.model.test.ts`): Tests validation, virtual properties
  - JWT Utility (`jwt.utils.test.ts`): Tests token generation and verification

- **Integration Tests**:
  - Auth Routes (`auth.routes.test.ts`): Tests login, registration endpoints
  - (Additional integration tests can be added for other routes)

## Frontend Testing Setup

1. **Test Framework**: Vitest with React Testing Library
2. **API Mocking**: MSW (Mock Service Worker)
3. **Types of Tests**:
   - Unit tests for components and services
   - Integration tests for pages and features

### Frontend Tests

- **Unit Tests**:
  - LoadingSpinner (`LoadingSpinner.test.tsx`): Tests rendering with different props
  - Auth Service (`authService.test.ts`): Tests login, registration, token handling

- **Integration Tests**:
  - Login Page (`LoginPage.test.tsx`): Tests form submission, error handling, UI interactions

## CI/CD Pipeline

Our GitHub Actions workflow (`ci-cd.yml`) provides:

1. **Continuous Integration**:
   - Runs on each push to main/dev and pull requests
   - Separate jobs for frontend and backend
   - Linting, testing, and building in isolated environments

2. **Continuous Deployment** (only on main branch):
   - Docker image building for both frontend and backend
   - Push to Amazon ECR (Elastic Container Registry)
   - Update ECS (Elastic Container Service) for deployment

### Pipeline Steps

1. **Backend Tests**:
   - Install dependencies
   - Run linting (with warnings allowed)
   - Build the application
   - Run tests
   - Upload coverage reports

2. **Frontend Tests**:
   - Install dependencies
   - Run linting (with warnings allowed)
   - Run tests
   - Build the application
   - Upload coverage reports

3. **Deployment** (main branch only):
   - Configure AWS credentials
   - Login to Amazon ECR
   - Build and push Docker images
   - Update ECS services

## Local Development with Docker

A `docker-compose.yml` file is provided for local development and testing:

- MongoDB container for local database
- Backend container for API services
- Frontend container for web interface

Run with `docker-compose up` to start the entire stack locally.

## Next Steps

1. Add more comprehensive tests for:
   - Book management features
   - Borrowing workflows
   - User management
   - Notifications system

2. Add end-to-end tests with Cypress or Playwright

3. Implement test coverage thresholds in CI pipeline
