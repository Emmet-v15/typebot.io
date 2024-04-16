## Create Analytics Record

Creates a new record in the analytics model with the provided data.

### HTTP Request

`POST /api/analytics/:typebotid/stats`

### Headers

| Header        | Value                         |
| ------------- | ----------------------------- |
| Authorization | Bearer YOUR_ANALYTICS_API_KEY |

### URL Parameters

| Parameter | Description                           |
| --------- | ------------------------------------- |
| typebotId | The unique identifier for the typebot |

### Request Body

```json
{
  "completed": Boolean,
  "userMessages": Integer,
  "callbackAsked": Boolean,
  "averageResponseTime": Float (optional),
  "chatTime": Float (optional)
}
```

### Responses

#### 201 Created

**Success Response:**
A new analytics record has been successfully created.

```json
{
  "message": "Record created"
}
```

#### 400 Bad Request

**Client Error Response:**
The request body is invalid or missing required fields.

```json
{
  "message": "Invalid request body"
}
```

#### 401 Unauthorized

**Client Error Response:**
The request lacks valid authentication credentials for the target resource or if the 'Authorization' header is missing or does not start with 'Bearer '.

```json
{
  "message": "Unauthorized"
}
```

Please replace `YOUR_ANALYTICS_API_KEY` with the actual API key you intend to use for authentication. Ensure that this key is kept secure and not exposed in the client-side code of your React application.
