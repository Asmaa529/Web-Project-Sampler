import { describe, it, expect } from "vitest";
import request from "supertest";      // supertest is used to make HTTP requests to the Express app
import { app } from "../src/app.mjs"; // import the Express app to be tested

// Simple health check test. The describe function is from vitest and groups related tests
// The fist parameter is the group name, second parameter is a function that contains the tests
describe("health", () => {
  // Test the GET /api/health endpoint. The it function is from vitest and defines a test case
  // first parameter is the test name, second parameter is an async function that contains the test logic
  it("GET /api/health -> { ok: true }", async () => {
    // Make a GET request to the /api/health endpoint
    const res = await request(app).get("/api/health").expect(200);
    // Check that the response body has the expected structure and values
    // Here we expect an object with an "ok" property set to true and a "now" property that is a string (ISO date)
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.now).toBe("string");
  });
});
