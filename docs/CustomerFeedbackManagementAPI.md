# Customer Feedback Management API

## Overview
The Customer Feedback Management API enables organizations to collect, manage, and analyze customer feedback efficiently. It provides endpoints for submitting feedback, retrieving and updating feedback entries, posting management responses, and generating analytics summaries. This API is ideal for businesses seeking to improve customer satisfaction by acting on feedback in a structured way.

## Endpoints

### 1. Submit Feedback
- **Endpoint:** `POST /feedback`
- **Description:** Submit new customer feedback.
- **Request Body:**
  - `customerName` (string, required)
  - `email` (string, optional)
  - `rating` (integer, required)
  - `comments` (string, optional)
- **Response:**
  - Created feedback entry with `id`, `customerName`, `email`, `rating`, `comments`, `createdAt`.
- **Status Codes:**
  - 201 Created, 400 Bad Request

### 2. List Feedback
- **Endpoint:** `GET /feedback`
- **Description:** Retrieve a list of all submitted feedback entries.
- **Query Parameters:**
  - `status` (string, optional)
  - `dateRange` (string, optional)
  - `limit` (integer, optional)
  - `offset` (integer, optional)
- **Response:**
  - Array of feedback objects.
- **Status Codes:**
  - 200 OK, 400 Bad Request

### 3. Get Feedback by ID
- **Endpoint:** `GET /feedback/{id}`
- **Description:** Retrieve a specific feedback entry by its unique ID.
- **Path Parameter:**
  - `id` (string, required)
- **Response:**
  - Feedback object with all details.
- **Status Codes:**
  - 200 OK, 404 Not Found

### 4. Update Feedback
- **Endpoint:** `PATCH /feedback/{id}`
- **Description:** Update an existing feedback entry by its unique ID.
- **Path Parameter:**
  - `id` (string, required)
- **Request Body:**
  - Fields to update (e.g., `status`, `managementNotes`)
- **Response:**
  - Updated feedback object.
- **Status Codes:**
  - 200 OK, 404 Not Found

### 5. Post Management Response
- **Endpoint:** `POST /feedback/{id}/response`
- **Description:** Post a management response to a specific feedback entry.
- **Path Parameter:**
  - `id` (string, required)
- **Request Body:**
  - `responseMessage` (string, required)
  - `responderName` (string, required)
- **Response:**
  - Updated feedback object with management response.
- **Status Codes:**
  - 200 OK, 404 Not Found

### 6. Analytics Summary
- **Endpoint:** `GET /analytics/summary`
- **Description:** Retrieve an analytics summary of customer feedback.
- **Query Parameters:**
  - `dateRange` (string, optional)
- **Response:**
  - Summary object with analytics data (`averageRating`, `feedbackCount`, `trendData`, `commonTopics`).
- **Status Codes:**
  - 200 OK, 400 Bad Request

### 7. Delete Feedback
- **Endpoint:** `DELETE /feedback/{feedback_id}`
- **Description:** Delete a specific feedback entry by its unique ID.
- **Path Parameter:**
  - `feedback_id` (string, required)
- **Headers:**
  - `Authorization: Bearer <token>` (required)
  - `Content-Type: application/json`
- **Response:**
  - Confirmation message or status.
- **Status Codes:**
  - 204 No Content, 404 Not Found, 401 Unauthorized, 403 Forbidden, 500 Internal Server Error
- **Edge Cases:**
  - Feedback does not exist, already deleted, unauthorized/unverified user attempts deletion.

## Request/Response Structure
- All endpoints accept and return JSON unless otherwise specified.
- Standard HTTP status codes are used for responses.

## Additional Notes
- Ensure required fields are provided in requests.
- Use the analytics endpoint to monitor trends and satisfaction metrics.

---

For detailed usage, see each endpoint's documentation in the Postman collection: [Customer Feedback Management API](https://go.postman.co/collection/47653690-eb7b5ffa-321a-47be-bfdc-f745d428dbde)
