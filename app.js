To add error handling middleware to the existing project, you can create a separate middleware function and apply it to the Express app. Here's how you can modify the `app.js` file to include error handling middleware:

```javascript
// app.js

// ... existing code ...

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'An error occurred',
    message: err.message
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Payment service running on port ${PORT}`);
  await initDatabase();
});
```

In this updated version of `app.js`, we added an error handling middleware function at the end of the middleware chain. This middleware function takes four parameters: `err`, `req`, `res`, and `next`.

The error handling middleware does the following:
1. It logs the error using `console.error()` to display the error details in the console.
2. It sets the response status code to `err.status` if it exists, or defaults to `500` (Internal Server Error) if no specific status code is provided.
3. It sends a JSON response with an error message and the actual error message from `err.message`.

By adding this error handling middleware, any errors that occur during the request processing will be caught and handled appropriately. The error details will be logged, and a generic error response will be sent back to the client.

Make sure to place this error handling middleware after all other routes and middleware in your `app.js` file.

With this addition, your project now includes error handling middleware to handle and respond to errors in a consistent manner.